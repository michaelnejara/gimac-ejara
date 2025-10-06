export const environment = {
    production: true,
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
        level: 'error',
        enableConsoleLogging: false,
        enableRemoteLogging: true
    },

    nellysCoin: {
        apiUrl: 'https://prodbox-nellys-coin-v2.ejaraapis.xyz/api/v1',
        clientKey: 'e59de08018',
        clientSecret: 'q7uaGP*2ENy0MWX!yjLeZ*q2x',
    },
    mfa: {
        apiUrl: 'https://prodbox-mfa.ejaraapis.xyz',
        clientKey: '0024053021',
        clientSecret: 'vJ[ZXKOnbPuZtKaoQblfbpX)%',
    },
    gimacPayment: {
        apiUrl: '',
        clientKey: '',
        clientSecret: '',
        useMockData: false
    }
};
