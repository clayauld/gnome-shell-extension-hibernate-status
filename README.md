# gnome-shell-extension-hibernate-status

Gnome Shell extension that adds a hibernate/hybrid suspend button in Status menu.

This repository is a Pop!\_OS 22.04 LTS–focused fork of the upstream project. Pop!\_OS 22.04 ships an older GNOME stack (42-based), so this fork backports the upstream functionality and ensures every feature—including the Power Off / Log Out submenu placement—works on that environment.

Originally developed by [@arelange](https://github.com/arelange) and then [@p91paul](https://github.com/p91paul). Now maintained by [@slaclau](https://github.com/slaclau).

This fork is maintained by [@clayauld](https://github.com/clayauld).

Supports GNOME 45, 46, 47, and 48 upstream; this fork specifically targets Pop!\_OS 22.04 LTS (GNOME 42).

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
