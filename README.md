# gnome-shell-extension-hibernate-status

Gnome Shell extension that adds a hibernate/hybrid suspend button in Status menu.

This repository is a Pop!\_OS 22.04 LTS–focused fork of the upstream project. Pop!\_OS 22.04 ships an older GNOME stack (42-based), so this fork backports the upstream functionality and ensures every feature—including the Power Off / Log Out submenu placement—works on that environment.

Originally developed by [@arelange](https://github.com/arelange) and then [@p91paul](https://github.com/p91paul). Now maintained by [@slaclau](https://github.com/slaclau).

This fork is maintained by [@clayauld](https://github.com/clayauld).

Supports GNOME 45, 46, 47, and 48 upstream; this fork specifically targets Pop!\_OS 22.04 LTS (GNOME 42).

## Install from source

1. Ensure build prerequisites are installed (`git`, `make`, `glib-compile-schemas`, and `msgfmt` from `gettext`).
2. Clone and build:

       git clone https://github.com/clayauld/gnome-shell-extension-hibernate-status.git
       cd gnome-shell-extension-hibernate-status
       make

3. Install for just your user:

       make install

   This places the extension in `~/.local/share/gnome-shell/extensions/hibernate-status@dromi`.

4. (Optional) Install system-wide instead:

       sudo make DESTDIR=/ install
       sudo glib-compile-schemas /usr/share/glib-2.0/schemas

   This copies the schema to `/usr/share/glib-2.0/schemas` (and recompiles it so GNOME sees the new keys) plus locales under `/usr/share/locale`.

5. Restart GNOME Shell (`Alt`+`F2`, enter `r`) or log out/in, then enable the extension via GNOME Extensions.

## Uninstall

### Remove local install

If you installed with `make install`, remove the extension directory and restart GNOME Shell:

    rm -rf ~/.local/share/gnome-shell/extensions/hibernate-status@dromi

### Remove system-wide install

If you installed via `sudo make DESTDIR=/ install`, remove the files placed in `/usr/share` and recompile schemas:

    sudo rm -rf /usr/share/gnome-shell/extensions/hibernate-status@dromi
    sudo rm -f /usr/share/locale/*/LC_MESSAGES/hibernate-status-button.mo
    sudo rm -f /usr/share/glib-2.0/schemas/org.gnome.shell.extensions.hibernate-status-button.gschema.xml
    sudo glib-compile-schemas /usr/share/glib-2.0/schemas

After uninstalling (local or system-wide), restart GNOME Shell (`Alt`+`F2`, `r`) or log out/in to finish cleanup.

## FAQ

### Hibernation does not work

Try launching from your terminal

    systemctl hibernate

If it doesn't work, it means hibernation is disabled on your system. Please see:

https://askubuntu.com/questions/1034185/ubuntu-18-04-cant-resume-after-hibernate/1064114#1064114

or

https://help.ubuntu.com/16.04/ubuntu-help/power-hibernate.html

### Hibernation button does not show up, but systemctl hibernate works

If you are running Ubuntu, try putting

    [Enable hibernate in upower]
    Identity=unix-user:*
    Action=org.freedesktop.upower.hibernate
    ResultActive=yes

    [Enable hibernate in logind]
    Identity=unix-user:*
    Action=org.freedesktop.login1.hibernate;org.freedesktop.login1.handle-hibernate-key;org.freedesktop.login1;org.freedesktop.login1.hibernate-multiple-sessions;org.freedesktop.login1.hibernate-ignore-inhibit;org.freedesktop.login1.suspend-then-hibernate;org.freedesktop.login1.suspend-then-hibernate-multiple-sessions;org.freedesktop.login1.suspend-then-hibernate-ignore-inhibit
    ResultActive=yes

into /etc/polkit-1/localauthority/10-vendor.d/com.ubuntu.desktop.pkla

Otherwise check for similar settings for your distribution. Credit: https://github.com/arelange/gnome-shell-extension-hibernate-status/issues/41#issuecomment-565883599
