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

    const suspend_row = new Adw.SwitchRow({
        title: _('Suspend'),
    });
    modes_group.add(suspend_row);
    const hibernate_row = new Adw.SwitchRow({
        title: _('Hibernate'),
    });
    modes_group.add(hibernate_row);
    const hybrid_row = new Adw.SwitchRow({
        title: _('Hybrid sleep'),
    });
    modes_group.add(hybrid_row);
    const suspend_then_hibernate_row = new Adw.SwitchRow({
        title: _('Suspend then hibernate'),
    });
    modes_group.add(suspend_then_hibernate_row);
    const restart_row = new Adw.SwitchRow({
        title: _('Restart...'),
    });
    modes_group.add(restart_row);
    const restart_to_row = new Adw.SwitchRow({
        title: _('Restart to...'),
    });
    modes_group.add(restart_to_row);
    const shutdown_row = new Adw.SwitchRow({
        title: _('Power Off...'),
    });
    modes_group.add(shutdown_row);

    const dialog_group = new Adw.PreferencesGroup({
        title: _('Dialogs'),
        description: _('Which dialogs should be enabled'),
    });
    page.add(dialog_group);

    const hibernate_dialog_row = new Adw.SwitchRow({
        title: _('Hibernate'),
    });
    dialog_group.add(hibernate_dialog_row);
    const hybrid_dialog_row = new Adw.SwitchRow({
        title: _('Hybrid sleep'),
    });
    dialog_group.add(hybrid_dialog_row);
    const suspend_then_hibernate_dialog_row = new Adw.SwitchRow({
        title: _('Suspend then Hibernate'),
    });
    dialog_group.add(suspend_then_hibernate_dialog_row);

    // Bind settings
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
}
