module.exports = {
  input: [
    'src/**/*.{js,jsx,ts,tsx}',
  ],
  output: './public/locales/$LOCALE/$NAMESPACE.json',
  options: {
    debug: false,
    removeUnusedKeys: true,
    sort: true,
    lngs: ['en', 'th'],
    defaultLng: 'en',
    defaultNs: 'translation',
    ns: [
      'translation'
    ],
    resource: {
      loadPath: 'public/locales/{{lng}}/{{ns}}.json',
      savePath: 'public/locales/{{lng}}/{{ns}}.json',
      jsonIndent: 2,
      lineEnding: '\n'
    },
    keySeparator: false,
    nsSeparator: false
  }
}; 