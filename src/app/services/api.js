/*
 * Licensed under the Apache License, Version 2.0 Copyright 2017 Tabix LLC,Igor Strykhar and other contributors
 */

((angular, smi2) => {
    'use strict';

    angular.module(smi2.app.name).service('API', API);
    API.$inject = ['$http', '$q', 'localStorageService', '$sanitize', 'ThemeService'];

    /**
     * @ngdoc service
     * @name smi2.service:API
     * @description API manager
     */
    function API($http, $q, localStorageService, $sanitize, ThemeService) {

        const CURRENT_BASE_KEY = 'currentBaseConfig';
        const DEFAULT_PORT = 8123;
        let _DatabaseStructure=new DatabaseStructure();
        let database = null;
        let connection = {};

        // Первичная загрузка данных из LS
        let data = localStorageService.get(CURRENT_BASE_KEY);
        if (data && ( data.host || data.tabix) ) {
            connection = data;
        }

        /**
         * @ngdoc method
         * @methodOf smi2.service:API
         * @name setConnection
         * @description Сохранение данных подключения в БД
         * @param {mixed} db Данные подключения
         */
        this.setConnection = (db) => {
            localStorageService.set(CURRENT_BASE_KEY, db);
            connection = angular.copy(db);

            // Check port
            // if (!/.*\:\d+$/.test(connection.host)) {
            //     connection.host += ':' + DEFAULT_PORT;
            // }
        };
        this.isAuthorized = () => {
            // console.log("this.connection",connection);
            if (this.isTabixServer()) {
                if (!connection) return false;
                if (!connection.tabix) return false;
                return connection.tabix.server;
            }
            else {
                if (!connection) return false;
                return connection.host;
            }
        };
        /**
         * @ngdoc method
         * @methodOf smi2.service:API
         * @name clear
         * @description Сброс авторизации
         */
        this.clear = () => {
            database = null;
            connection = {};
            localStorageService.set(CURRENT_BASE_KEY, {});
            _DatabaseStructure=new DatabaseStructure();
        };

        this.hashCode = function(s){
            return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
        };

        this.DS_CacheKey = () => {
            let k='_databaseStructure:'+JSON.stringify(connection);
            k=this.hashCode(k);
            return k;
        };
        this.DS_storeCache = (columns,tables,databases,dictionaries,functions) => {
            let d={
                columns:columns,
                tables:tables,
                databases:databases,
                dictionaries:dictionaries,
                functions:functions,
                ttl:Date.now()
            };
            return localStorageService.set(this.DS_CacheKey(),d);
        };

        this.DS_fetchFromCache = () => {
            let d=localStorageService.get(this.DS_CacheKey());
            if (!d || !d.ttl) return false;
            // Cache old ?
            let diff=((Date.now() -d.ttl)/(1000*3600));

            // Cache TTL DatabaseStructure
            if (diff>1.5) return false;
            if (d && d.functions && d.functions.length>1 )
            {
                _DatabaseStructure.init(d.columns,d.tables,d.databases,d.dictionaries,d.functions);
                return true;
            }
            return false;
        };

        this.resetDatabaseStructure = () => {
            console.log('reset databaseStructure');
            localStorageService.set('_databaseStructure:'+this.getHost()+':'+this.getLogin(),[]);
        };
        /**
         *
         * @returns {DatabaseStructure}
         * @constructor
         */
        this.databaseStructure = (call,forceReload) =>{

            if (!forceReload && _DatabaseStructure.isInit()) {
                return call(_DatabaseStructure);
            }


            if (!forceReload && this.DS_fetchFromCache() && _DatabaseStructure.isInit())
            {
                console.info("restore from cache : database Structure!");
                return call(_DatabaseStructure);
            }
            if (forceReload) {
                _DatabaseStructure=new DatabaseStructure();
            }

            console.time("Load Database Structure!");
            this.fetchQuery( "SELECT * FROM system.columns" ).then(columns => {
                this.fetchQuery( "SELECT database,name,engine FROM system.tables" ).then(tables => {
                    this.fetchQuery( "SELECT name FROM system.databases" ).then(databases => {
                        this.fetchQuery("SELECT name,key,attribute.names,attribute.types from system.dictionaries ARRAY JOIN attribute ORDER BY name,attribute.names", null).then((dictionaries) => {
                            this.fetchQuery("SELECT name,is_aggregate from system.functions", null).then((functions) => {
                                console.timeEnd("Load Database Structure!");
                                this.DS_storeCache(columns.data,tables.data,databases.data,dictionaries.data,functions.data);
                                _DatabaseStructure.init(columns.data,tables.data,databases.data,dictionaries.data,functions.data);
                                return call(_DatabaseStructure);
                            } , (response) => {throw response } );//functions
                        } , (response) => {throw response } );//dictionaries
                    } , (response) => {throw response } );//databases
                } , (response) => {throw response } );//system.tables

            } , (response) => {throw response } );//system.columns

            return true;

        };


        /**
         * @ngdoc method
         * @methodOf smi2.service:API
         * @name getConnectionInfo
         * @description Получение данных подключения
         * @return {mixed} Объект с данными подключения
         */
        this.getConnectionInfo = () => connection;

        /**
         * @ngdoc method
         * @methodOf smi2.service:API
         * @name setDatabase
         * @description Установка дефолтной БД
         * @param {mixed} db Данные БД
         */
        this.setDatabase = (db) => (database = db);

        /**
         * @ngdoc method
         * @methodOf smi2.service:API
         * @name getDatabase
         * @description Get database info
         */
        this.getDatabase = () => database;

        this.getHost = () => {
            return  (connection.host);
        };
        this.getPassword = () => {
            return  (connection.password);
        };

        this.getLogin = () => {
            return (connection.login);
        };


        this.makeQueryId = () => {
                let text = "";
                let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            for (let i = 0; i < 8; i++)
                    text += possible.charAt(Math.floor(Math.random() * possible.length));
                return text;
        };

        this.isTabixServer = () => {
            if (!connection.tabix) return false;
            if (connection.tabix.server) return true;
            return false;
        };


        this.makeSqlQuery = (sql,format) => {
            let query = '';


            if (format !== false) {
                format = (format || ' FoRmAt JSON');
                if (format == 'null') {
                    format = '';
                }
                query = sql + "\n\n" + format;
            } else {
                query = sql;
            }
            return query;
        };

        this.direct_makeUrlRequest = (withDatabase,extend_settings) => {
            let url = "";
            let httpProto = '';
            if (!(connection.host.indexOf('://') > 0 || connection.host.indexOf('/') == 0)) {
                httpProto = 'http://';
            }
            // ClickHouse/dbms/src/Interpreters/Settings.h : https://github.com/yandex/ClickHouse/blob/master/dbms/src/Interpreters/Settings.h
            url = httpProto + connection.host ;
            url = url + '/?';
            url = url + 'add_http_cors_header=1&log_queries=1&output_format_json_quote_64bit_integers=1';
            if (!connection.NotCH1_1_54276) {
                url=url+'&output_format_json_quote_denormals=1';
            }
            //max_block_size=1&send_progress_in_http_headers=1&http_headers_progress_interval_ms=500
            let BasicAuthorization=false;

            if (connection.baseauth)
            {
                // skip add user + password
            }
            else {

                if (connection.password)
                {
                    url += '&user='+encodeURIComponent(connection.login)+'&password='+encodeURIComponent(connection.password);
                }
                else
                {
                    url += '&user='+encodeURIComponent(connection.login);
                }
            }



            if (withDatabase) {
                url += '&database=' + encodeURIComponent(database);
            }
            if (extend_settings) {
                url += '&' + extend_settings;
            }
            if (connection.params){
                url += '&'+connection.params;
            }
            return url;

        };
        this.fetchQuery = (sql,withDatabase,format,extend_settings) =>
        {
            if (!this.isTabixServer()) {
                return this.direct_fetchQuery(sql,withDatabase,format,extend_settings);
            } else {
                return this.ts_fetchQuery(sql,withDatabase,format,extend_settings);
            }

        };





        this.pushProjectState = (body) => {
            return this.fetchTabixServer('projectstate/push',body);
        };

        this.getProjectState = (body) => {
            return this.fetchTabixServer('projectstate/fetch',body);
        };


        this.getStructure= (body) => {
            return this.fetchTabixServer('structure',body);
        };

        this.getWidget= (wId,body) => {
            return this.fetchTabixServer('widget/'+wId,body);
        };

        this.getDashboard= (dashId,body) => {
            return this.fetchTabixServer('dashboard/'+dashId,body);
        };

        this.getDashboardsTree = (body) => {
            return this.fetchTabixServer('dashboards',body);
        };


        this.fetchTabixServer = (action,body,extend_settings) =>
        {

            if (!_.isObject(body)) body={};

            let url = connection.tabix.server;
            url = url + '/'+action+'?tabix_client='+window.TabixVersion+'&random='+Math.round(Math.random() * 100000000);
            if (extend_settings) {
                url += '&' + extend_settings;
            }

            let request = {
                version:window.TabixVersion,
                auth: {
                    login: connection.tabix.login,
                    password: connection.tabix.password,
                    confid:connection.tabix.confid
                }
            };

            request = Object.assign(body,request);

            let init={
                mode: 'cors',
                method: 'post',
                headers: {
                    "Content-type": "application/json; charset=UTF-8"
                },
                body : (JSON.stringify(request))
            };

            console.info("TS Request",url,init);

            let myRequest = new Request(url, init);



            return fetch(myRequest)
                .then(function(response) {
                    let contentType = response.headers.get("content-type");
                    if (contentType.includes('text/plain') && response.status == 200 &&  response.statusText.toLowerCase() == 'ok' )
                    {
                        // create table && drop table
                        return 'OK';

                    }
                    if (contentType && contentType.includes("application/json") && response.status >= 200 && response.status < 300) {
                        return Promise.resolve(response)
                    } else {
                        return response.text().then(Promise.reject.bind(Promise));
                    }
                })
                .then(function(response) {
                        if (response==='OK') {
                            return 'OK';
                        }
                        return response.json();
                    },
                    function (responseBody) {
                        return Promise.reject(responseBody);
                    }
                );

        };


        this.ts_fetchQuery = (sql,withDatabase,format,extend_settings) =>
        {

            return this.fetchTabixServer('query',{
                query:this.makeSqlQuery(sql,format)
            },extend_settings);


        };



        this.direct_fetchQuery = (sql,withDatabase,format,extend_settings) =>
        {

            let query=this.makeSqlQuery(sql,format);
            let url=this.direct_makeUrlRequest(withDatabase,extend_settings);
            let myInit={
                mode: 'cors',
                method: 'post',

                headers: {
                    "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
                },
                body : query
            };


            if (connection.includeCredentials)
            {
                myInit.credentials='include'; // Error : The value of the 'Access-Control-Allow-Origin' header in the response must not be the wildcard '*' when the request's credentials mode is 'include'.
            }

            let myRequest = new Request(url, myInit);


            return fetch(myRequest)
                .then(function(response) {

                    let contentType = response.headers.get("content-type");


                    // console.info("response",response);
                    // console.info("contentType",contentType);
                    if (contentType.includes('text/tab-separated-values') && response.status == 200 &&  response.statusText.toLowerCase() == 'ok' )
                    {
                        // if insert
                        return 'OK';
                    }
                    if (contentType.includes('text/plain') && response.status == 200 &&  response.statusText.toLowerCase() == 'ok' )
                    {
                        // if create table && drop table
                        return 'OK';

                    }
                    if (contentType && contentType.includes("application/json") && response.status >= 200 && response.status < 300) {
                        return Promise.resolve(response);
                    } else {
                        return response.text().then(Promise.reject.bind(Promise));
                    }
                })
                .then(function(response) {

                        if (response==='OK') {
                            return 'OK';
                        }
                        return response.json();
                    },
                    function (responseBody) {
                        return Promise.reject(responseBody);
                    }
                );
                // .catch(function(error)
                //     {
                //             console.error("fetchQuery",error);
                //     });
        };
    }
})(angular, smi2);
