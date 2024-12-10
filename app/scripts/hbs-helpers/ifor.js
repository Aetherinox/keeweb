import Handlebars from 'hbs';

/*
    Handlebars > If Or Options

    allows you to match one of many different options.
    args must be passed as a single string, and are then broken up into
    an array object before being compared.

    if multiple options are passed, value only has to be one of the options to pass true

    @usage          {{#ifor backgroundState '["random", "custom"]'}}
*/

Handlebars.registerHelper('ifor', (value, args, options) => {
    const list = JSON.parse(args);
    const opts = [];
    for (let i = 0; i < list.length; i++) {
        if (typeof list[i] === 'string') {
            opts[i] = list[i];
        }
    }

    return opts.includes(value) === true ? options.fn(this) : options.inverse(this);
});
