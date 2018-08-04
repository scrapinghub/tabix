// This config defines the editor's view.
export const options = {
    lineNumbers: false,
    scrollBeyondLastLine: false,
    readOnly: false,
    fontSize: 12,
};

// This config defines how the language is displayed in the editor.
export const languageDef = {
    base:'sql',
    defaultToken: '',
    tokenPostfix: '.sql',
    ignoreCase: true,
    number: /\d+(\.\d+)?/,
    brackets: [
        { open: '[', close: ']', token: 'delimiter.square' },
        { open: '(', close: ')', token: 'delimiter.parenthesis' }
    ],

    keywords: [
        'SELECT',
        'CASE',
        'THEN',
        'DISTINCT',
        'INSERT',
        'UPDATE',
        'DELETE',
        'WHERE',
        'AND',
        'OR',
        'OFFSET',
        'HAVING',
        'AS',
        'FROM',
        'WHEN',
        'ELSE',
        'USING',
        'END',
        'TYPE',
        'LEFT',
        'RIGHT',
        'JOIN',
        'ON',
        'OUTER',
        'DESC',
        'ASC',
        'UNION',
        'CREATE',
        'TABLE',
        'PRIMARY',
        'KEY FOREIGN',
        'NOT',
        'REFERENCES',
        'INNER',
        'CROSS',
        'NATURAL',
        'DATABASE',
        'DROP',
        'GRANT',
        'ARRAY JOIN',
        'ANY',
        'BETWEEN',
        'ENGINE',
        'ATTACH',
        'DETACH',
        'CAST',
        'WITH',
        'BIT_AND',
        'BIT_OR',
        'TO',
        'BIT_XOR',
        'DESCRIBE',
        'OPTIMIZE',
        'PREWHERE',
        'TOTALS',
        'DATABASES',
        'PROCESSLIST',
        'SHOW',
        'IF',

        // FORM
        'FORMAT JSON',
        'FORMAT JSONCompact',
        'FORMAT JSONEachRow',
        'FORMAT TSV',
        'FORMAT TabSeparated',
        'FORMAT TabSeparatedWithNames',
        'FORMAT TabSeparatedWithNamesAndTypes',
        'FORMAT TabSeparatedRaw',
        'FORMAT BlockTabSeparated',
        'FORMAT TSKV',
        'FORMAT CSV',
        'FORMAT CSVWithNames',
        // SYS
        'SYSTEM RELOAD CONFIG',
        'DROP TEMPORARY TABLE',
        'EXISTS TEMPORARY TABLE',
        'SYSTEM RELOAD DICTIONARY',
        'SYSTEM RELOAD DICTIONARIES',
        'SYSTEM DROP DNS CACHE',
        'SYSTEM SHUTDOWN',
        'SYSTEM KILL',
        'CLEAR COLUMN IN PARTITION'
    ],
    operators: [
        // Logical
        'ALL', 'AND', 'ANY', 'BETWEEN', 'EXISTS', 'IN', 'LIKE', 'NOT', 'OR', 'SOME',
        // Set
        'EXCEPT', 'INTERSECT', 'UNION',
        // Join
        'APPLY', 'CROSS', 'FULL', 'INNER', 'JOIN', 'LEFT', 'OUTER', 'RIGHT',
        // Predicates
        'CONTAINS', 'FREETEXT', 'IS', 'NULL',
        // Pivoting
        'PIVOT', 'UNPIVOT',
        // Merging
        'MATCHED'
    ],
    builtinFunctions: [
        // Aggregate
        'AVG', 'CHECKSUM_AGG', 'COUNT', 'COUNT_BIG', 'GROUPING', 'GROUPING_ID', 'MAX', 'MIN', 'SUM', 'STDEV', 'STDEVP', 'VAR', 'VARP',
        // Analytic
        'CUME_DIST',
    ],
    builtinVariables: [
        'true','false','NULL'
    ],
    pseudoColumns: [
        '$ACTION', '$IDENTITY', '$ROWGUID', '$PARTITION'
    ],
    tokenizer: {
        root: [
            { include: '@comments' },
            { include: '@whitespace' },
            { include: '@pseudoColumns' },
            { include: '@numbers' },
            { include: '@strings' },
            { include: '@complexIdentifiers' },
            { include: '@scopes' },
            [/[;,.]/, 'delimiter'],
            [/[()]/, '@brackets'],
            [/[\w@#$]+/, {
                cases: {
                    '@keywords': 'keyword',
                    '@operators': 'operator',
                    '@builtinVariables': 'predefined',
                    '@builtinFunctions': 'predefined',
                    '@default': 'identifier'
                }
            }],
            [/[<>=!%&+\-*/|~^]/, 'operator'],
        ],
        whitespace: [
            [/\s+/, 'white']
        ],
        comments: [
            [/--+.*/, 'comment'],
            [/\/\*/, { token: 'comment.quote', next: '@comment' }]
        ],
        comment: [
            [/[^*/]+/, 'comment'],
            // Not supporting nested comments, as nested comments seem to not be standard?
            // i.e. http://stackoverflow.com/questions/728172/are-there-multiline-comment-delimiters-in-sql-that-are-vendor-agnostic
            // [/\/\*/, { token: 'comment.quote', next: '@push' }],    // nested comment not allowed :-(
            [/\*\//, { token: 'comment.quote', next: '@pop' }],
            [/./, 'comment']
        ],
        pseudoColumns: [
            [/[$][A-Za-z_][\w@#$]*/, {
                cases: {
                    '@pseudoColumns': 'predefined',
                    '@default': 'identifier'
                }
            }],
        ],
        numbers: [
            [/0[xX][0-9a-fA-F]*/, 'number'],
            [/[$][+-]*\d*(\.\d*)?/, 'number'],
            [/((\d+(\.\d*)?)|(\.\d+))([eE][\-+]?\d+)?/, 'number']
        ],
        strings: [
            [/N'/, { token: 'string', next: '@string' }],
            [/'/, { token: 'string', next: '@string' }]
        ],
        string: [
            [/[^']+/, 'string'],
            [/''/, 'string'],
            [/'/, { token: 'string', next: '@pop' }]
        ],
        complexIdentifiers: [
            [/\[/, { token: 'identifier.quote', next: '@bracketedIdentifier' }],
            [/"/, { token: 'identifier.quote', next: '@quotedIdentifier' }]
        ],
        bracketedIdentifier: [
            [/[^\]]+/, 'identifier'],
            [/]]/, 'identifier'],
            [/]/, { token: 'identifier.quote', next: '@pop' }]
        ],
        quotedIdentifier: [
            [/[^"]+/, 'identifier'],
            [/""/, 'identifier'],
            [/"/, { token: 'identifier.quote', next: '@pop' }]
        ],
        scopes: [
            [/BEGIN\s+(DISTRIBUTED\s+)?TRAN(SACTION)?\b/i, 'keyword'],
            [/BEGIN\s+TRY\b/i, { token: 'keyword.try' }],
            [/END\s+TRY\b/i, { token: 'keyword.try' }],
            [/BEGIN\s+CATCH\b/i, { token: 'keyword.catch' }],
            [/END\s+CATCH\b/i, { token: 'keyword.catch' }],
            [/(BEGIN|CASE)\b/i, { token: 'keyword.block' }],
            [/END\b/i, { token: 'keyword.block' }],
            [/WHEN\b/i, { token: 'keyword.choice' }],
            [/THEN\b/i, { token: 'keyword.choice' }]
        ]
    }
};

// This config defines the editor's behavior.
export const configuration = {
    comments: {
        lineComment: '--',
        blockComment: ['/*', '*/'],
    },
    brackets: [
        ['{', '}'],
        ['[', ']'],
        ['(', ')']
    ],
    autoClosingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"' },
        { open: '\'', close: '\'' },
    ],
    surroundingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"' },
        { open: '\'', close: '\'' },
    ]
};