export interface AppConfig {
    bottomGutterHeight?: string
    hideRightBar?: boolean
    hideAcmLogo?: boolean
    hideMemeOfTheDay?: boolean
}

export const defaultConfig: AppConfig = {
    hideMemeOfTheDay: true // WARNING: THESE MEMES SUCK!! THE API IS BAD!!
};

export const solsticeConfig: AppConfig = {
    bottomGutterHeight: '30px',
    hideRightBar: true,
    hideAcmLogo: true,
    hideMemeOfTheDay: true
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