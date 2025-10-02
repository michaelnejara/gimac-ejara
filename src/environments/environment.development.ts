export const environment = {
    production: false,
    apiUrl: 'http://localhost:3000/api',
    websocketUrl: 'ws://localhost:3000',
    appName: 'Ejara Admin Panel',
    version: '1.0.0',
    features: {
        enableMockData: true,
        enableDevTools: true,
        enableAuditLogging: true,
    },
    logging: {
        level: 'debug',
        enableConsoleLogging: true,
        enableRemoteLogging: false
    },

    nellyCoin: {
        apiUrl: 'https://testbox-nellys-coin-v2.ejaraapis.xyz',
        clientKey: '2ead6d590b',
        clientSecret: 'sJtJPkBlX!VBq1HEnjqAz0o7D',
    },
    mfa: {
        apiUrl: 'https://testbox-mfa.ejaraapis.xyz',
        clientKey: '3de2fbdb78',
        clientSecret: '93Kyno#2uFDOMY*HWC2OpeuR(',  
    },
};
