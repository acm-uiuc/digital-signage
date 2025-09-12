#!/bin/bash
set -e
if [ "$EUID" -ne 0 ]; then
  echo "Error: This script must be run as root."
  exit 1
fi

USER="acm"
KIOSK_URL="https://acmuiuc-digital-signage.acmuiuc.workers.dev/default"
TMP_DIR=/home/$USER/tmp

if id -u "$USER" &>/dev/null; then
    echo "Securing user account: $USER"
    echo "--> Removing user from sudoers..."
    gpasswd -d $USER sudo
    echo "--> Deleting user's password..."
    passwd -d $USER
    echo "User account secured."
else
    echo "Error: User '$USER' not found."
    exit 1
fi
apt-get purge -y lightdm labwc xorg
apt-get install -y --no-install-recommends unclutter
apt-get install -y cage seatd chromium-browser

mkdir -p /home/$USER/.xdg/
cat << EOF > /home/$USER/launch.sh
#!/bin/sh
export XDG_RUNTIME_DIR=\$(mktemp -d)
export XCURSOR_PATH=\$(mktemp -d)
export WLR_LIBINPUT_NO_DEVICES=1
rm -rf /root/.config/chromium/
cage -- /usr/bin/chromium-browser --noerrdialogs --no-sandbox --disable-infobars --kiosk --app=https://acmuiuc-digital-signage.acmuiuc.workers.dev/default
EOF

# disable the HDMI-CEC input device so cage doesn't show a pointer when there isn't one. 
cat << EOF > /etc/udev/rules.d/99-ignore-hdmi-cec.rules
ACTION!="remove",KERNEL=="event[0-9]*",ATTRS{name}=="vc4-hdmi*",ENV{LIBINPUT_IGNORE_DEVICE}="1"
EOF

udevadm control --reload-rules
udevadm trigger

chown root:root /home/$USER/launch.sh
chmod -R 755 /home/$USER/launch.sh
chmod +x /home/$USER/launch.sh


cat << EOF > /lib/systemd/system/kiosk.service
[Unit]
Description=Kiosk application
After=systemd-user-sessions.service plymouth-quit.service
Conflicts=getty@tty1.service

[Service]
User=root
Group=root
WorkingDirectory=/home/$USER
InaccesiblePaths=/usr/share/icons/
ExecStart=/home/$USER/launch.sh
Restart=always
RestartSec=3
TTYPath=/dev/tty1
StandardInput=tty
StandardOutput=tty
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable kiosk
systemctl restart kiosk
systemctl disable bluetooth 
systemctl stop bluetooth