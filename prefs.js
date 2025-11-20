const Gio = imports.gi.Gio;
const Adw = imports.gi.Adw;
const ExtensionUtils = imports.misc.extensionUtils;
const Gettext = imports.gettext;

const Me = ExtensionUtils.getCurrentExtension();
const GETTEXT_DOMAIN = Me.metadata['gettext-domain'] || 'hibernate-status-button';
const SETTINGS_SCHEMA = 'org.gnome.shell.extensions.hibernate-status-button';
const ExtensionDomain = Gettext.domain(GETTEXT_DOMAIN);
const __ = ExtensionDomain.gettext;
const N__ = ExtensionDomain.ngettext;

function init() {
    ExtensionUtils.initTranslations(GETTEXT_DOMAIN);
}

function _createPreferencesPage() {
    const page = new Adw.PreferencesPage({
        title: __('General'),
        icon_name: 'dialog-information-symbolic',
    });
    const modes_group = new Adw.PreferencesGroup({
        title: __('Modes'),
        description: __('Which buttons should be enabled'),
    });
    page.add(modes_group);

    const suspend_row = new Adw.SwitchRow({
        title: __('Suspend'),
    });
    modes_group.add(suspend_row);
    const hibernate_row = new Adw.SwitchRow({
        title: __('Hibernate'),
    });
    modes_group.add(hibernate_row);
    const hybrid_row = new Adw.SwitchRow({
        title: __('Hybrid sleep'),
    });
    modes_group.add(hybrid_row);
    const suspend_then_hibernate_row = new Adw.SwitchRow({
        title: __('Suspend then hibernate'),
    });
    modes_group.add(suspend_then_hibernate_row);
    const restart_row = new Adw.SwitchRow({
        title: __('Restart...'),
    });
    modes_group.add(restart_row);
    const restart_to_row = new Adw.SwitchRow({
        title: __('Restart to...'),
    });
    modes_group.add(restart_to_row);
    const shutdown_row = new Adw.SwitchRow({
        title: __('Power Off...'),
    });
    modes_group.add(shutdown_row);

    const dialog_group = new Adw.PreferencesGroup({
        title: __('Dialogs'),
        description: __('Which dialogs should be enabled'),
    });
    page.add(dialog_group);

    const hibernate_dialog_row = new Adw.SwitchRow({
        title: __('Hibernate'),
    });
    dialog_group.add(hibernate_dialog_row);
    const hybrid_dialog_row = new Adw.SwitchRow({
        title: __('Hybrid sleep'),
    });
    dialog_group.add(hybrid_dialog_row);
    const suspend_then_hibernate_dialog_row = new Adw.SwitchRow({
        title: __('Suspend then Hibernate'),
    });
    dialog_group.add(suspend_then_hibernate_dialog_row);

    const settings = ExtensionUtils.getSettings(SETTINGS_SCHEMA);
    settings.bind('show-suspend', suspend_row, 'active',
        Gio.SettingsBindFlags.DEFAULT);
    settings.bind('show-hibernate', hibernate_row, 'active',
        Gio.SettingsBindFlags.DEFAULT);
    settings.bind('show-hybrid-sleep', hybrid_row, 'active',
        Gio.SettingsBindFlags.DEFAULT);
    settings.bind('show-suspend-then-hibernate', suspend_then_hibernate_row, 'active',
        Gio.SettingsBindFlags.DEFAULT);
    settings.bind('show-restart', restart_row, 'active',
        Gio.SettingsBindFlags.DEFAULT);
    settings.bind('show-custom-reboot', restart_to_row, 'active',
        Gio.SettingsBindFlags.DEFAULT);
    settings.bind('show-shutdown', shutdown_row, 'active',
        Gio.SettingsBindFlags.DEFAULT);
    settings.bind('show-hibernate-dialog', hibernate_dialog_row, 'active',
        Gio.SettingsBindFlags.DEFAULT);
    settings.bind('show-hybrid-sleep-dialog', hybrid_dialog_row, 'active',
        Gio.SettingsBindFlags.DEFAULT);
    settings.bind('show-suspend-then-hibernate-dialog', suspend_then_hibernate_dialog_row, 'active',
        Gio.SettingsBindFlags.DEFAULT);

    return page;
}

function fillPreferencesWindow(window) {
    const page = _createPreferencesPage();
    window.add(page);
}

function buildPrefsWidget() {
    const page = _createPreferencesPage();
    return page;
}
