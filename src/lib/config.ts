export interface AppConfig {
    bottomGutterHeight: string
}

export const defaultConfig: AppConfig = {
    bottomGutterHeight: '0vh'
};

export const solsticeConfig: AppConfig = {
    bottomGutterHeight: '4vh'
};

const configs = {
    'default': defaultConfig,
    'solstice': solsticeConfig
}

export const getConfig = (environment: string | null): AppConfig => {
    if (environment && Object.keys(configs).includes(environment)) {
        return configs[environment as keyof typeof configs];
    }
    return configs.default;
};