// file: src/api/article/content-types/article/lifecycles.js

'use strict';

/**
 * Stub translation service.
 * Replace this with your real async call to DeepL, Google Translate, etc.
 */
async function translate(text, from = 'en', to) {
  // e.g. call external API here...
  // return await myTranslateClient.translate(text, { from, to });
  return `[${to}] ` + text; // stub: prefix with locale code
}

module.exports = {
  lifecycles: {
    /**
     * Before creating an Article:
     * - if no locale specified, default to 'en'
     * - auto-translate summary & content into pt-BR, es-ES, fr-FR
     */
    async beforeCreate(event) {
      const { data } = event.params;

      // only translate primary locale (english)
      if (data.locale && data.locale !== 'en') {
        return;
      }

      const translations = ['pt-BR', 'es-ES', 'fr-FR'];

      // for each target locale
      for (const locale of translations) {
        // create nested object in the payload: e.g. data.localizations = [{ locale, summary, content }, ...]
        data.localizations = data.localizations || [];
        data.localizations.push({
          locale,
          summary: await translate(data.summary, 'en', locale),
          content: await translate(data.content, 'en', locale),
        });
      }
    },

    /**
     * Before updating an Article:
     * - if summary or content changed and locale = 'en', re-sync translations
     */
    async beforeUpdate(event) {
      const { data, where } = event.params;

      // Only act if updating English master
      if (data.locale && data.locale !== 'en') {
        return;
      }

      // Fetch existing article to see if summary/content changed
      const existing = await strapi.entityService.findOne('api::article.article', where.id, {
        populate: ['localizations'],
      });

      const hasChanged =
        (data.summary && data.summary !== existing.summary) ||
        (data.content && data.content !== existing.content);

      if (!hasChanged) {
        return;
      }

      const translations = ['pt-BR', 'es-ES', 'fr-FR'];

      // For each existing localization, update summary/content
      for (const locEntry of existing.localizations) {
        if (translations.includes(locEntry.locale)) {
          await strapi.entityService.update('api::article.article', existing.id, {
            data: {
              localizations: [
                {
                  id: locEntry.id,
                  summary: data.summary
                    ? await translate(data.summary, 'en', locEntry.locale)
                    : locEntry.summary,
                  content: data.content
                    ? await translate(data.content, 'en', locEntry.locale)
                    : locEntry.content,
                },
              ],
            },
          });
        }
      }
    },
  },
};
