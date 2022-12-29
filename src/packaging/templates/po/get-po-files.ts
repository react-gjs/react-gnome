export const getPoFiles = (params: { appName: string }) => [
  {
    language: "en",
    content: `
msgid ""
msgstr ""
"Project-Id-Version: ${params.appName} 1.0.0\\n"
"Report-Msgid-Bugs-To: \\n"
"POT-Creation-Date: 2013-02-22 03:56+0100\\n"
"PO-Revision-Date: 2013-02-22 03:58+0100\\n"
"Last-Translator: \\n"
"Language-Team: English\\n"
"Language: en\\n"
"MIME-Version: 1.0\\n"
"Content-Type: text/plain; charset=utf-8\\n"
"Content-Transfer-Encoding: 8bit\\n"
`.trim(),
  },
];
