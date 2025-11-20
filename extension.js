const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const GObject = imports.gi.GObject;
const St = imports.gi.St;
const Clutter = imports.gi.Clutter;

const LoginManager = imports.misc.loginManager;
const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;
const ModalDialog = imports.ui.modalDialog;
const Dialog = imports.ui.dialog;
const CheckBox = imports.ui.checkBox.CheckBox;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Gettext = imports.gettext;
const Domain = Gettext.domain(Me.metadata['gettext-domain']);
const _ = Domain.gettext;
const N_ = function(e) { return e; };
const C_ = Domain.pgettext;

const HIBERNATE_CHECK_TIMEOUT = 20000;

var HibernateButtonExtension = GObject.registerClass(
class HibernateButtonExtension extends GObject.Object {
    _init() {
        super._init();
    }

    _loginManagerCanHibernate(asyncCallback) {
        if (this._loginManager._proxy) {
            // systemd path
            this._loginManager._proxy.call(
                'CanHibernate',
                null,
                Gio.DBusCallFlags.NONE,
                -1,
                null,
                function (proxy, asyncResult) {
                    let result, error;

                    try {
                        result = proxy.call_finish(asyncResult).deep_unpack();
                    } catch (e) {
                        error = e;
                    }

                    if (error) asyncCallback(false);
                    else asyncCallback(!['no', 'na'].includes(result[0]));
                }
            );
        } else {
            this.can_hibernate_sourceID = GLib.idle_add(GLib.PRIORITY_DEFAULT, () => {
                asyncCallback(false);
                return false;
            });
        }
    }

    _loginManagerHibernate() {
        if (this._setting.get_boolean('hibernate-works-check')) {
            this._hibernateStarted = new Date();
            this.hibernate_sourceID = GLib.timeout_add(
                GLib.PRIORITY_DEFAULT,
                HIBERNATE_CHECK_TIMEOUT,
                () => this._checkDidHibernate()
            );
        }
        if (this._loginManager._proxy) {
            // systemd path
            this._loginManager._proxy.call(
                'Hibernate',
                GLib.Variant.new('(b)', [true]),
                Gio.DBusCallFlags.NONE,
                -1,
                null,
                null
            );
        } else {
            // Can't do in ConsoleKit
            this._loginManager.emit('prepare-for-sleep', true);
            this._loginManager.emit('prepare-for-sleep', false);
        }
    }

    _loginManagerCanHybridSleep(asyncCallback) {
        if (this._loginManager._proxy) {
            // systemd path
            this._loginManager._proxy.call(
                'CanHybridSleep',
                null,
                Gio.DBusCallFlags.NONE,
                -1,
                null,
                function (proxy, asyncResult) {
                    let result, error;

                    try {
                        result = proxy.call_finish(asyncResult).deep_unpack();
                    } catch (e) {
                        error = e;
                    }

                    if (error) asyncCallback(false);
                    else asyncCallback(!['no', 'na'].includes(result[0]));
                }
            );
        } else {
            this.can_hybrid_sleep_sourceID = GLib.idle_add(GLib.PRIORITY_DEFAULT, () => {
                asyncCallback(false);
                return false;
            });
        }
    }

    _loginManagerHybridSleep() {
        if (this._loginManager._proxy) {
            // systemd path
            this._loginManager._proxy.call(
                'HybridSleep',
                GLib.Variant.new('(b)', [true]),
                Gio.DBusCallFlags.NONE,
                -1,
                null,
                null
            );
        } else {
            // Can't do in ConsoleKit
            this._loginManager.emit('prepare-for-sleep', true);
            this._loginManager.emit('prepare-for-sleep', false);
        }
    }

    _loginManagerCanSuspendThenHibernate(asyncCallback) {
        if (this._loginManager._proxy) {
            // systemd path
            this._loginManager._proxy.call(
                'CanSuspendThenHibernate',
                null,
                Gio.DBusCallFlags.NONE,
                -1,
                null,
                function (proxy, asyncResult) {
                    let result, error;

                    try {
                        result = proxy.call_finish(asyncResult).deep_unpack();
                    } catch (e) {
                        error = e;
                    }

                    if (error) asyncCallback(false);
                    else asyncCallback(!['no', 'na'].includes(result[0]));
                }
            );
        } else {
            this.can_suspend_then_hibernate_sourceID = GLib.idle_add(GLib.PRIORITY_DEFAULT, () => {
                asyncCallback(false);
                return false;
            });
        }
    }

    _loginManagerSuspendThenHibernate() {
        if (this._loginManager._proxy) {
            // systemd path
            this._loginManager._proxy.call(
                'SuspendThenHibernate',
                GLib.Variant.new('(b)', [true]),
                Gio.DBusCallFlags.NONE,
                -1,
                null,
                null
            );
        } else {
            // Can't do in ConsoleKit
            this._loginManager.emit('prepare-for-sleep', true);
            this._loginManager.emit('prepare-for-sleep', false);
        }
    }

    _updateHaveHibernate() {
        this._loginManagerCanHibernate(result => {
            log(`Able to hibernate: ${result}`);
            this._haveHibernate = result;
            this._updateHibernate();
        });
    }

    _updateHibernate() {
        this._hibernateMenuItem.visible =
            this._haveHibernate && !Main.sessionMode.isLocked && this._setting.get_boolean('show-hibernate');
    }

    _updateHaveHybridSleep() {
        this._loginManagerCanHybridSleep(result => {
            log(`Able to hybrid-sleep: ${result}`);
            this._haveHybridSleep = result;
            this._updateHybridSleep();
        });
    }

    _updateHybridSleep() {
        this._hybridSleepMenuItem.visible =
            this._haveHybridSleep && !Main.sessionMode.isLocked  && this._setting.get_boolean('show-hybrid-sleep');
    }

    _updateHaveSuspendThenHibernate() {
        this._loginManagerCanSuspendThenHibernate(result => {
            log(`Able to suspend then hibernate: ${result}`);
            this._haveSuspendThenHibernate = result;
            this._updateSuspendThenHibernate();
        });
    }

    _updateSuspendThenHibernate() {
        this._suspendThenHibernateMenuItem.visible =
            this._haveSuspendThenHibernate && !Main.sessionMode.isLocked  && this._setting.get_boolean('show-suspend-then-hibernate');
    }

    _updateDefaults() {
        if (!this._targetMenu) return;

        let menuItems = this._targetMenu._getMenuItems()
        for (let menuItem of menuItems) {
            if (menuItem.label) {
                if ( menuItem.label.get_text() === _('Suspend') ) {
                    menuItem.visible = this._setting.get_boolean('show-suspend');
                }
                if ( menuItem.label.get_text() === _('Restart…') ) {
                    menuItem.visible = this._setting.get_boolean('show-restart');
                }
                if ( menuItem.label.get_text() === _('Power Off…') ) {
                    menuItem.visible = this._setting.get_boolean('show-shutdown');
                }
            }
        }
    }

    _onHibernateClicked() {
        this._targetMenu.close();

        if (this._setting.get_boolean('show-hibernate-dialog')) {
            let DialogContent = {
                subject: C_('title', _('Hibernate')),
                description: _('Do you really want to hibernate the system?'),
                confirmButtons: [
                    {
                        signal: 'Cancel',
                        label: C_('button', _('Cancel')),
                        key: Clutter.Escape,
                    },
                    {
                        signal: 'Confirmed',
                        label: C_('button', _('Hibernate')),
                        default: true,
                    },
                ],
            };

            this._dialog = new ConfirmDialog(
                DialogContent
            );
            this._dialog.connect('Confirmed', () =>
                this._loginManagerHibernate()
            );
            this._dialog.open();
        } else {
            this._loginManagerHibernate()
        }
    }

    _onHybridSleepClicked() {
        this._targetMenu.close();

        if (this._setting.get_boolean('show-hybrid-sleep-dialog')) {
            let DialogContent = {
                subject: C_('title', _('Hybrid Sleep')),
                description: _('Do you really want to hybrid sleep the system?'),
                confirmButtons: [
                    {
                        signal: 'Cancel',
                        label: C_('button', _('Cancel')),
                        key: Clutter.Escape,
                    },
                    {
                        signal: 'Confirmed',
                        label: C_('button', _('Hybrid Sleep')),
                        default: true,
                    },
                ],
            };

            this._dialog = new ConfirmDialog(
                DialogContent
            );
            this._dialog.connect('Confirmed', () =>
                this._loginManagerHybridSleep()
            );
            this._dialog.open();
        } else {
            this._loginManagerHybridSleep()
        }
    }

    _onSuspendThenHibernateClicked() {
        this._targetMenu.close();

        if (this._setting.get_boolean('show-suspend-then-hibernate-dialog')) {
            let DialogContent = {
                subject: C_('title', _('Suspend then Hibernate')),
                description: _('Do you really want to suspend then hibernate the system?'),
                confirmButtons: [
                    {
                        signal: 'Cancel',
                        label: C_('button', _('Cancel')),
                        key: Clutter.Escape,
                    },
                    {
                        signal: 'Confirmed',
                        label: C_('button', _('Suspend then Hibernate')),
                        default: true,
                    },
                ],
            };

            this._dialog = new ConfirmDialog(
                DialogContent
            );
            this._dialog.connect('Confirmed', () =>
                this._loginManagerSuspendThenHibernate()
            );
            this._dialog.open();
        } else {
            this._loginManagerSuspendThenHibernate()
        }
    }

    _disableExtension() {
        Main.extensionManager.disableExtension('hibernate-status@dromi')
        console.log('Disabled')
    }

    _cancelDisableExtension(notAgain) {
        if (notAgain) this.setHibernateWorksCheckEnabled(false);
    }

    _checkRequirements() {
        if (GLib.access('/run/systemd/seats', 0) < 0) {
            let SystemdMissingDialogContent = {
                subject: C_('title', _('Hibernate button: Systemd Missing')),
                description: _('Systemd seems to be missing and is required.'),
                confirmButtons: [
                    {
                        signal: 'Cancel',
                        label: C_('button', _('Cancel')),
                        key: Clutter.Escape,
                    },
                    {
                        signal: 'DisableExtension',
                        label: C_('button', _('Disable Extension')),
                        default: true,
                    },
                ],
                iconName: 'document-save-symbolic',
                iconStyleClass: 'end-session-dialog-shutdown-icon',
            };

            this._dialog = new ConfirmDialog(
                SystemdMissingDialogContent
            );
            this._dialog.connect('DisableExtension', this._disableExtension);
            this._dialog.open();
        }
    }

    _checkDidHibernate() {
        /* This function is called HIBERNATE_CHECK_TIMEOUT ms after
         * hibernate started. If it is successful, at that point the GS
         * process is already frozen; so when this function is actually
         * called, way more than HIBERNATE_CHECK_TIMEOUT ms are passed*/
        if (
            new Date() - this._hibernateStarted >
            HIBERNATE_CHECK_TIMEOUT + 5000
        ) {
            // hibernate succeeded
            return;
        }
        // hibernate failed

        let HibernateFailedDialogContent = {
            subject: C_('title', _('Hibernate button: Hibernate failed')),
            description: _(
                'Looks like hibernation failed. On some linux distributions hibernation is disabled ' +
                    'because not all hardware supports it well; ' +
                    'please check your distribution documentation ' +
                    'on how to enable it.'
            ),
            checkBox: _("You are wrong, don't check this anymore!"),
            confirmButtons: [
                {
                    signal: 'Cancel',
                    label: C_('button', _('Cancel')),
                    key: Clutter.Escape,
                },
                {
                    signal: 'DisableExtension',
                    label: C_('button', _('Disable Extension')),
                    default: true,
                },
            ],
            iconName: 'document-save-symbolic',
            iconStyleClass: 'end-session-dialog-shutdown-icon',
        }
        this._dialog = new ConfirmDialog(
            HibernateFailedDialogContent
        );
        this._dialog.connect('DisableExtension', this._disableExtension);
        this._dialog.connect('Cancel', this._cancelDisableExtension);
        this._dialog.open();
    }

    setHibernateWorksCheckEnabled(enabled) {
        let key = 'hibernate-works-check';
        if (this._setting.is_writable(key)) {
            if (this._setting.set_boolean(key, enabled)) {
                Gio.Settings.sync();
            } else {
                throw this._errorSet(key);
            }
        } else {
            throw this._errorWritable(key);
        }
    }

    _modifySystemItem() {
        this._setting = ExtensionUtils.getSettings();
        this._checkRequirements();
        this._loginManager = LoginManager.getLoginManager();

        // Target Menu Logic
        if (Main.panel.statusArea.quickSettings) {
            // GNOME 43+
            this._targetMenu = Main.panel.statusArea.quickSettings._system._systemItem.menu;
        } else if (Main.panel.statusArea.aggregateMenu) {
             // GNOME 42: Search for the "Power Off / Log Out" submenu
             let foundSubMenu = false;
             let menuItems = Main.panel.statusArea.aggregateMenu.menu._getMenuItems();
             for (let item of menuItems) {
                 if (item instanceof PopupMenu.PopupSubMenuMenuItem) {
                    // Check label content roughly to support English/localization if possible,
                    // or just check if it has a menu and looks right.
                    // Usually labeled "Power Off / Log Out" or similar.
                    // We can search for items inside it to confirm?
                    // Pop!_OS might have "Power Off"
                    let labelText = item.label.get_text();
                    if (labelText.includes("Power Off") || labelText.includes(_("Power Off"))) {
                        this._targetMenu = item.menu;
                        foundSubMenu = true;
                        break;
                    }
                 }
             }
             if (!foundSubMenu) {
                 // Fallback to root menu if submenu not found
                 this._targetMenu = Main.panel.statusArea.aggregateMenu.menu;
             }
        } else {
            // Fallback or error
            log("Hibernate Button: Could not find system menu");
            return;
        }

        this._hibernateMenuItem = new PopupMenu.PopupMenuItem(_('Hibernate'));
        this._hibernateMenuItemId = this._hibernateMenuItem.connect(
            'activate',
            () => this._onHibernateClicked()
        );

        this._hybridSleepMenuItem = new PopupMenu.PopupMenuItem(
            _('Hybrid Sleep')
        );
        this._hybridSleepMenuItemId = this._hybridSleepMenuItem.connect(
            'activate',
            () => this._onHybridSleepClicked()
        );

        this._suspendThenHibernateMenuItem = new PopupMenu.PopupMenuItem(
            _('Suspend then Hibernate')
        );
        this._suspendThenHibernateMenuItemId = this._suspendThenHibernateMenuItem.connect(
            'activate',
            () => this._onSuspendThenHibernateClicked()
        );

        // Find position to insert
        let insertIndex = -1;
        let menuItems = this._targetMenu._getMenuItems();
        for (let i = 0; i < menuItems.length; i++) {
            let item = menuItems[i];
            if (item.label) {
                 let text = item.label.get_text();
                 if (text === _('Suspend') || text === _('Power Off…') || text === _('Restart…')) {
                     insertIndex = i;
                     // Insert before the first found item of this group?
                     // Usually we want: Suspend, Hibernate, Hybrid, Power Off
                     // If we find 'Suspend', we want to be after it?
                     // Or if we find 'Power Off', we want to be before it?
                     // The original code used `numMenuItems - 5`.

                     // Let's try to place it *after* Suspend if found, otherwise *before* Power Off.
                     if (text === _('Suspend')) {
                         insertIndex = i + 1;
                     }
                     // If we find Power Off and haven't found Suspend (or want to group),
                     // typically Suspend is above Power Off.
                 }
            }
        }

        // If we didn't find a specific anchor, just append? Or put at the end?
        // In aggregateMenu, "Power Off / Logout" is usually near the end.
        if (insertIndex === -1) {
            insertIndex = Math.max(0, menuItems.length - 1);
        }

        this._targetMenu.addMenuItem(
            this._hybridSleepMenuItem,
            insertIndex
        );
        this._targetMenu.addMenuItem(
            this._hibernateMenuItem,
            insertIndex
        );
        this._targetMenu.addMenuItem(
            this._suspendThenHibernateMenuItem,
            insertIndex
        );

        this._menuOpenStateChangedId = this._targetMenu.connect(
            'open-state-changed',
            (menu, open) => {
                if (!open) return;
                this._updateDefaults();
                this._updateHaveHibernate();
                this._updateHaveHybridSleep();
                this._updateHaveSuspendThenHibernate();
            }
        );
    }

    _queueModifySystemItem() {
        this.sourceId = GLib.idle_add(GLib.PRIORITY_DEFAULT, () => {
            let systemMenuExists = (Main.panel.statusArea.quickSettings) ||
                                   (Main.panel.statusArea.aggregateMenu);

            if (!systemMenuExists)
                return GLib.SOURCE_CONTINUE;

            this._modifySystemItem();
            return GLib.SOURCE_REMOVE;
        });
    }

    enable() {
        let systemMenuExists = (Main.panel.statusArea.quickSettings) ||
                               (Main.panel.statusArea.aggregateMenu);

        if (!systemMenuExists) {
            this._queueModifySystemItem();
        } else {
            this._modifySystemItem();
        }
    }

    disable() {
        this._setting = null;
        if (this._menuOpenStateChangedId) {
            this._targetMenu.disconnect(
                this._menuOpenStateChangedId
            );
            this._menuOpenStateChangedId = 0;
        }

        if (this._suspendThenHibernateMenuItemId) {
            this._suspendThenHibernateMenuItem.disconnect(this._suspendThenHibernateMenuItemId);
            this._suspendThenHibernateMenuItemId = 0;
        }

        if (this._hybridSleepMenuItemId) {
            this._hybridSleepMenuItem.disconnect(this._hybridSleepMenuItemId);
            this._hybridSleepMenuItemId = 0;
        }

        if (this._hibernateMenuItemId) {
            this._hibernateMenuItem.disconnect(this._hibernateMenuItemId);
            this._hibernateMenuItemId = 0;
        }

        if (this._suspendThenHibernateMenuItem) {
            this._suspendThenHibernateMenuItem.destroy();
            this._suspendThenHibernateMenuItem = 0;
        }

        if (this._hybridSleepMenuItem) {
            this._hybridSleepMenuItem.destroy();
            this._hybridSleepMenuItem = 0;
        }

        if (this._hibernateMenuItem) {
            this._hibernateMenuItem.destroy();
            this._hibernateMenuItem = 0;
        }

        if (this.sourceId) {
            GLib.Source.remove(this.sourceId);
            this.sourceId = null;
        }

        if (this.can_suspend_then_hibernate_sourceID) {
            GLib.Source.remove(this.can_suspend_then_hibernate_sourceID);
            this.can_suspend_then_hibernate_sourceID = null;
        }

        if (this.can_hybrid_sleep_sourceID) {
            GLib.Source.remove(this.can_hybrid_sleep_sourceID);
            this.can_hybrid_sleep_sourceID = null;
        }

        if (this.can_hibernate_sourceID) {
            GLib.Source.remove(this.can_hibernate_sourceID);
            this.can_hibernate_sourceID = null;
        }

        if (this.hibernate_sourceID) {
            GLib.Source.remove(this.hibernate_sourceID);
            this.hibernate_sourceID = null;
        }
    };
});

const _DIALOG_ICON_SIZE = 32;

var ConfirmDialog = GObject.registerClass(
    {
        Signals: {
            Confirmed: {param_types: [GObject.TYPE_BOOLEAN]},
            DisableExtension: {param_types: [GObject.TYPE_BOOLEAN]},
            Cancel: {param_types: [GObject.TYPE_BOOLEAN]},
        },
    },
    class ConfirmDialog extends ModalDialog.ModalDialog {
        _init(dialog) {
            super._init({
                styleClass: 'end-session-dialog',
                destroyOnClose: true,
            });


            this._messageDialogContent = new Dialog.MessageDialogContent();


            this._messageDialogContent.description = dialog.description;
            this._messageDialogContent.title = dialog.subject;

            if (dialog.iconName) {
                this._icon = new St.Icon({
                    icon_name: dialog.iconName,
                    icon_size: _DIALOG_ICON_SIZE,
                    style_class: dialog.iconStyleClass,
                });
            }

            if (dialog.checkBox) {
                this._checkBox = new CheckBox(dialog.checkBox);
                this._messageDialogContent.add(this._checkBox.actor);
            }

            this.contentLayout.add_child(this._messageDialogContent);

            let buttons = [];
            for (let i = 0; i < dialog.confirmButtons.length; i++) {
                let signal = dialog.confirmButtons[i].signal;
                let label = dialog.confirmButtons[i].label;
                let keys = dialog.confirmButtons[i].key;
                buttons.push({
                    action: () => {
                        let signalId = this.connect('closed', () => {
                            this.disconnect(signalId);
                            this._confirm(signal);
                        });
                        this.close();
                    },
                    label: label,
                    key: keys,
                });
            }

            this.setButtons(buttons);
        }

        _confirm(signal) {
            var checked;
            if (this._checkBox) checked = this._checkBox.actor.get_checked();
            this.emit(signal, checked);
        }

        cancel() {
            this.close();
        }
    }
);

function init() {
    return new HibernateButtonExtension();
}
