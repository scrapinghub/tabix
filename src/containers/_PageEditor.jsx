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


export default class _PageEditor extends Component {
    constructor() {
        super();
        // console.warn(connectedApi());
        //
        //
        this.state = {data: [], layout: {}, frames: [],DatabaseStructure:false,code: '@@LANGID select * from  ABSOLUTE 1234 ALL COUNT COUNT() -- type your code...'};
    }
    componentDidMount() {

        if (connectedApi()) {
            connectedApi().getDatabaseStructure() |> console.log;
            // this.state.DatabaseStructure=connectedApi().getDatabaseStructure();
        }

    }
    editorWillMount(monaco)
    {
        this.monaco=monaco;
        if (!monaco.languages.getLanguages().some(({ id }) => id === 'clickhouse')) {
            // Register a new language
            monaco.languages.register({ id: 'clickhouse' });
            // Register a tokens provider for the language
            monaco.languages.setMonarchTokensProvider('clickhouse', languageDef);
            // Set the editing configuration for the language
            monaco.languages.setLanguageConfiguration('clickhouse', configuration);
            console.log('monaco - register ClickHouse',languageDef);
        }

    }
    editorDidMount(editor, monaco) {



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