export const getPoMesonBuild = () => `
langs = [
    'en'
]

if langs.length() > 0
intl.gettext(GETTEXT_PACKAGE,
    languages: langs,
    args: [
    '--from-code=UTF-8',
    '--keyword=g_dngettext:2,3',
    '--add-comments',
    ],
)
endif
  
`;
