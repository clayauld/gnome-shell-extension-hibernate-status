const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;
const Adw = imports.gi.Adw;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Gettext = imports.gettext;
const Domain = Gettext.domain(Me.metadata['gettext-domain']);
const _ = Domain.gettext;

function init() {}

function fillPreferencesWindow(window) {
    const settings = ExtensionUtils.getSettings();

    const page = new Adw.PreferencesPage({
        title: _('General'),
        icon_name: 'dialog-information-symbolic',
    });
    window.add(page);

    const modes_group = new Adw.PreferencesGroup({
        title: _('Modes'),
        description: _('Which buttons should be enabled'),
    });
    page.add(modes_group);

    function createSwitchRow(title, key) {
        const row = new Adw.ActionRow({
            title: title,
        });
        const toggle = new Gtk.Switch({
            valign: Gtk.Align.CENTER,
        });
        row.add_suffix(toggle);
        settings.bind(key, toggle, 'active', Gio.SettingsBindFlags.DEFAULT);
        row.activatable_widget = toggle;
        return row;
    }

    modes_group.add(createSwitchRow(_('Suspend'), 'show-suspend'));
    modes_group.add(createSwitchRow(_('Hibernate'), 'show-hibernate'));
    modes_group.add(createSwitchRow(_('Hybrid sleep'), 'show-hybrid-sleep'));
    modes_group.add(createSwitchRow(_('Suspend then hibernate'), 'show-suspend-then-hibernate'));
    modes_group.add(createSwitchRow(_('Restart...'), 'show-restart'));
    modes_group.add(createSwitchRow(_('Restart to...'), 'show-custom-reboot'));
    modes_group.add(createSwitchRow(_('Power Off...'), 'show-shutdown'));

    const dialog_group = new Adw.PreferencesGroup({
        title: _('Dialogs'),
        description: _('Which dialogs should be enabled'),
    });
    page.add(dialog_group);

    dialog_group.add(createSwitchRow(_('Hibernate'), 'show-hibernate-dialog'));
    dialog_group.add(createSwitchRow(_('Hybrid sleep'), 'show-hybrid-sleep-dialog'));
    dialog_group.add(createSwitchRow(_('Suspend then Hibernate'), 'show-suspend-then-hibernate-dialog'));
}
