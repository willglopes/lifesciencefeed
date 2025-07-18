module.exports = async ({ strapi }) => {
  const areas = [
    'cardiology','dermatology','haematology','oncology',
    'immunology','respiratory','neurology','inflammation',
    'rheumatology','endocrinology','general practitioner',
    'psychiatry','gastroenterology','gene therapy',
    'nephrology','ophthalmology','orthopaedics',
    'pathology and labs medicine','urology'
  ];

  for (const name of areas) {
    await strapi.db
      .query('api::therapy-area.therapy-area')
      .findOne({ where: { slug: strapi.service('api::therapy-area.therapy-area').createSlug(name) } })
    || await strapi.entityService.create('api::therapy-area.therapy-area', {
         data: { name, slug: name },
       });
  }
};
