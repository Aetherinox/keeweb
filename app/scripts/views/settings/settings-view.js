import { View } from 'framework/views/view';
import { Events } from 'framework/events';
import { Keys } from 'const/keys';
import { Features } from 'util/features';
import { Scrollable } from 'framework/views/scrollable';
import { StringFormat } from 'util/formatting/string-format';
import template from 'templates/settings/settings.hbs';
import dompurify from 'dompurify';
import wallpaper1 from 'wallpaper1';
import wallpaper2 from 'wallpaper2';
import wallpaper3 from 'wallpaper3';
import wallpaper4 from 'wallpaper4';

class SettingsView extends View {
    parent = '.app__body';
    template = template;
    events = {
        'click .settings__back-button': 'returnToApp'
    };

    constructor(model, options) {
        super(model, options);
        this.initScroll();
        this.listenTo(Events, 'set-page', this.setPage);
        this.onKey(Keys.DOM_VK_ESCAPE, this.returnToApp);
    }

    render() {
        super.render();
        this.createScroll({
            root: this.$el.find('.settings')[0],
            scroller: this.$el.find('.scroller')[0],
            bar: this.$el.find('.scroller__bar')[0]
        });

        this.pageEl = this.$el.find('.scroller');

        /*
            Backgrounds

            check relative path to wallpapers.
            'wallpapers' folder needs to be in root directory of keeweb.exe or index.html.
        */

        if (this.model.settings.backgroundState !== 'disabled') {
            const wallpaperDir = Features.isDesktop ? '../../' : '';
            const wallpaperArr = [wallpaper1, wallpaper2, wallpaper3, wallpaper4];
            const wallpaperSel = wallpaperArr[Math.floor(Math.random() * wallpaperArr.length)];

            let wallpaperPath = `${wallpaperDir}${wallpaperSel}`;
            if (
                this.model.settings.backgroundUrl &&
                this.model.settings.backgroundUrl !== '' &&
                this.model.settings.backgroundState === 'custom'
            ) {
                wallpaperPath = encodeURI(this.model.settings.backgroundUrl)
                    .replace(/[!'()]/g, encodeURI)
                    .replace(/\*/g, '%2A');
            }

            // sanitize for xss
            const cssBackground = dompurify.sanitize(
                'linear-gradient(rgba(32, 32, 32, 0.90), rgba(32, 32, 32, 0.90)), url(' +
                    wallpaperPath +
                    ') 0% 0% / cover'
            );

            this.$el.css('background', cssBackground);
        } else {
            this.$el.css('background', '');
        }
    }

    setPage(e) {
        // eslint-disable-next-line prefer-const
        let { page, section, file } = e;
        if (page === 'file' && file && file.backend === 'otp-device') {
            page = 'file-otp-device';
        }

        const module = require('./settings-' + page + '-view');
        const viewName = StringFormat.pascalCase(page);
        const SettingsPageView = module[`Settings${viewName}View`];

        if (this.views.page) {
            this.views.page.remove();
        }

        this.views.page = new SettingsPageView(file, { parent: this.pageEl[0] });
        this.views.page.appModel = this.model;
        this.views.page.render();
        this.file = file;
        this.page = page;
        this.pageResized();

        this.$el.scrollTop(0, 0);

        // ensure section not null, otherwise scroll wont go directly to top
        if (section !== null) {
            this.scrollToSection(section);
        }
    }

    scrollToSection(section) {
        let scrollEl;
        if (section) {
            scrollEl = this.views.page.el.querySelector(`#${section}`);
        }

        if (!scrollEl) {
            scrollEl = this.views.page.el.querySelector(`h1`);
        }

        if (scrollEl) {
            scrollEl.scrollIntoView(true);
        }
    }

    returnToApp() {
        Events.emit('toggle-settings', false);
    }
}

Object.assign(SettingsView.prototype, Scrollable);

export { SettingsView };
