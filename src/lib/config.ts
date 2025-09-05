export interface AppConfig {
    bottomGutterHeight?: string
    leftBarWidth: string
    rightBarWidth: string
}

export const defaultConfig: AppConfig = {
    leftBarWidth: '7/12',
    rightBarWidth: '5/12'
};

export const solsticeConfig: AppConfig = {
    bottomGutterHeight: '75px',
    leftBarWidth: '8/12',
    rightBarWidth: '0/12'
};

export const configs = {
    'default': defaultConfig,
    'solstice': solsticeConfig
}

export const getConfig = (environment: string | null): AppConfig => {
    if (environment && Object.keys(configs).includes(environment)) {
        return configs[environment as keyof typeof configs];
    }
    return configs.default;
};