import React, { Component } from 'react';
import {Popover,PopoverInteractionKind,Menu,MenuItem,MenuDivider, Button,AnchorButton,ButtonGroup,Position } from "@blueprintjs/core";
// import AceEditor from "../components/Ace/Ace.js";
// import SplitterLayout from 'Service/SplitterLayout.jsx';


import {languageDef,configuration} from "../components/Monaco/Clickhouse.js";
import {Classes, ContextMenu} from "@blueprintjs/core/lib/esm/index";
import {connectedApi} from 'api';
import MonacoEditor from 'react-monaco-editor';

const dataSources = {
    col1: [1, 2, 3], // eslint-disable-line no-magic-numbers
    col2: [4, 3, 2], // eslint-disable-line no-magic-numbers
    col3: [17, 13, 9], // eslint-disable-line no-magic-numbers
};

const dataSourceOptions = Object.keys(dataSources).map(name => ({
    value: name,
    label: name,
}));

const config = {editable: true};
/**
 * # TODO List
 * [-] Сворачивать скобки
 * [-] Bing key - Expand/Collapse
 * [-] AutoFormat SQL ?
 * [-] executeCommand
 * [-] splitByTokens & findTokens
 *
 */

export default class _PageEditor extends Component {
    constructor() {
        super();
        // console.warn(connectedApi());
        //
        //
        this.state = {data: [], layout: {}, frames: [],DatabaseStructure:false,code: `@@LANGID select * from  ABSOLUTE 1234 ALL COUNT COUNT() -- type your code...
        ;;
        
SELECT
	use_news_ctp,
	round(use_news_ctp*1.9,2) as show_CTP
FROM
	model.history_model_22_news
WHERE
	event_date>=today()-1
	AND 
	news_id IN (4724145)


ORDER BY event_time desc
LIMIT 100


        `};
    }
    componentDidMount() {

        if (connectedApi()) {
            connectedApi().getDatabaseStructure() |> console.log;
            // this.state.DatabaseStructure=connectedApi().getDatabaseStructure();
        }

    }
    editorWillMount(monaco)
    {

        if (!monaco.languages.getLanguages().some(({ id }) => id === 'clickhouse')) {
            // Register a new language
            monaco.languages.register({ id: 'clickhouse' });
            // Register a tokens provider for the language
            monaco.languages.setMonarchTokensProvider('clickhouse', languageDef);
            // Set the editing configuration for the language
            monaco.languages.setLanguageConfiguration('clickhouse', configuration);
            monaco.languages.registerCompletionItemProvider('clickhouse', {
                provideCompletionItems: function(model, position) {
                    return [
                        { label: 'Server' },
                        { label: 'Request' },
                        { label: 'Response' },
                        { label: 'Session' }
                    ];
                }});
            // registerCompletionItemProvider
            console.log('monaco - register ClickHouse',languageDef);
        }

    }
    executeCommand(typeCommand,editor,monaco)
    {
        window.edit=editor;//debug
        window.monaco=monaco;//debug



        let position=editor.getPosition();
        let selectedText=editor.getModel().getValueInRange(editor.getSelection());
        let allValue=editor.getValue();
        console.log('executeCommand running => ' + position);



        // console.info('!!!Text in selected!!!',selectedText);
        // console.info('!!!allValue!!!',allValue);
        let sql=allValue;
        if (!(selectedText === '' || selectedText === null)) { sql = selectedText;}
        console.info('%c '+sql, 'color: #bada55');


        //let range=monaco.editor.Range()
        let tokens=monaco.editor.tokenize('select * from ;; select','clickhouse');
        // console.log(editor,tokens);

        // Получить список всех -- WARN-Tokens
        // let selectSql = editor.getSelectedText();
        // let sql=tab.editor.getValue();
        // if (!(selectSql === '' || selectSql === null)) { sql = selectSql;}
        // .splitByTokens(sql, 'constant.character.escape', use_delimiter).forEach((item) => { })
        // Если исполнить текущий - то дальше не парсим если уже есть один в списке
        // if (type == 'current' && numquery>0) return;
        //   let drawCommand=[];
        //  let subSql = item.sql;
        //  Если комманда исполнить текущий и НЕ выделен текст -> пропускаем все пока не найдем подходящий
        //   if (type == 'current' && !selectSql) {
        //       let cursor = editor.selection.getCursor();
        //       let rg=item.range.compare(cursor.row, cursor.column);
        //       if (rg !== 0) return ;
        // let SaveSql=subSql.trim();
        // определяем есть ли комманда DRAW .* - все что после нее есть JavaScript
        // вырезаем если комманда есть
        // let set_format = editor.session.$mode.findTokens(subSql, "storage", true);
        // let keyword = editor.session.$mode.findTokens(subSql, "keyword", true);
        // for  ['DROP', 'CREATE', 'ALTER'].indexOf(keyword.toUpperCase())






        // console.log(' running => ' + editor.getPosition(),editor);
        // console.log(this.monaco);
        // let tokens=this.monaco.editor.tokenize('select * from ;; select','clickhouse');
        // console.log(editor,tokens);
        return null;
    }
    editorDidMount(editor, monaco) {
        this.monaco=monaco;
        const self = this;

        // editor._standaloneKeybindingService.addDynamicKeybinding("-actions.find")
        // editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_F, function() {});
        editor.addAction({
            id: 'my-exec-code',
            label: 'Exec current code',
            keybindings: [ monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
            // A precondition for this action.
            precondition: null,
            // A rule to evaluate on top of the precondition in order to dispatch the keybindings.
            keybindingContext: null,
            contextMenuGroupId: 'navigation',
            contextMenuOrder: 1.5,
            // Method that will be executed when the action is triggered.
            // @param editor The editor instance is passed in as a convinience
            // run:this.executeCommand
            run: function(editor) {
                self.executeCommand('current',editor,monaco);
                return null;
            }
        });

        editor.focus();
    }
    onChange(newValue, e) {

        console.log('onChange', newValue, e);
    }
    listDatabasePopover() {
        return (
            <Menu className={Classes.DARK}>
                <MenuItem text="system"         />
                <MenuItem text="model"          />
                <MenuItem text="ads"            />
                <MenuItem text="default" disabled={true} />
            </Menu>
        );
    }


    renderListDatabaseButton() {
        let currentDatase='default';

        return (
            <Popover content={this.listDatabasePopover()} position={Position.RIGHT_TOP} interactionKind={PopoverInteractionKind.HOVER}>
                <Button minimal rightIcon='caret-down' icon='database' text={currentDatase} minimal={true} />
            </Popover>
        );
    }
    render() {

        const code = this.state.code;
        const options = {
            automaticLayout:true,
            selectOnLineNumbers: true,
            fontSize:14,
            formatOnPaste:true,
            fontFamily:'Menlo'
        };


        const id='aceId'+Date.now().toString();
        return (
            <div className={'DivMonacoEditor'}>
                <MonacoEditor
                    width="100%"
                    height="600"
                    language="clickhouse"
                    theme="vs-dark"
                    value={code}
                    options={options}
                    editorWillMount={::this.editorWillMount}
                    onChange={::this.onChange}
                    editorDidMount={::this.editorDidMount}
                />
            </div>
        );
    }
}