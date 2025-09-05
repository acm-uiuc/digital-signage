export interface AppConfig {
    bottomGutterHeight?: string
    hideRightBar?: boolean
}

export const defaultConfig: AppConfig = {
};

export const solsticeConfig: AppConfig = {
    bottomGutterHeight: '75px',
    hideRightBar: true
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