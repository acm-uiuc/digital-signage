# Raspberry Pi Deployment Steps

1. Use headless Raspbian image
2. In the Raspberry Pi Imager, set the following options, changing the hostname to something unqiue/descriptive:

<img width="559" height="381" alt="image" src="https://github.com/user-attachments/assets/a10e92a7-d00f-4e48-bcd1-d7c740e15dee" />
<img width="542" height="190" alt="image" src="https://github.com/user-attachments/assets/b5795029-88f8-40df-b082-4cfd1143db57" />
<img width="535" height="368" alt="image" src="https://github.com/user-attachments/assets/346cda29-da9a-40d6-999f-c2bbadd7fca8" />


4. Flash to an SD Card, boot the Pi with the autologin.
5. Get a root shell via sudo.
6. Install Tailscale on the node, apply the tag `devel-root-ok`.
7. Go to `raspi-config`, disable autologin, screen blanking, and set boot to console.
8. Exit the physical shell and make sure you can SSH to the node via Tailscale.
9. Run the deploy.sh script.
10. Profit??
