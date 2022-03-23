import { I18n } from '@lingui/core'
import { en, de } from 'make-plural/plurals'

export function initTranslation(i18n: I18n): void {
    i18n.loadLocaleData({
        en: { plurals: en },
        de: { plurals: de },
    })
}

export async function loadTranslation(locale: string, isProduction = true) {
    let data
    if (isProduction) {
        data = await import(`../translations/locale/${locale}/messages`)
    } else {
        data = await import(
            `@lingui/loader!../translations/locale/${locale}/messages.po`
        )
    }
    return data.messages
}