/* eslint-disable @typescript-eslint/no-explicit-any */
import langZhCn from './assets/translation/zh_CN.json'
import langEnUs from './assets/translation/en_US.json'

export function useTranslation(): Record<string, string> {
  const locale = ((): Record<any, any> => {
    // determine user perferred language
    const preferredLanguages = navigator.languages
    const translations: Record<string, any> = {
      'zh-CN': langZhCn,
      'en-US': langEnUs,
    }
    for (const lang of preferredLanguages) {
      if (translations[lang]) {
        return translations[lang]
      }
    }
    return langZhCn
  })()

  return new Proxy(locale, {
    get(target, p) {
      if (Object.hasOwnProperty.call(target, p)) {
        return target[p as string]
      }
      return p
    },
  })
}
