# Lab 3 Writeup

**Sound**
After going through Farnell's *Designing Sound*, I choose to try and recreate the sound of crackling fire. It sort of consists of three main components: the "roar" of the flames, the sizzle of the fire, and the crackling pop sound.

**Approach**
I sort of used a similiar approach as the initial Part I portion of the lab in terms of white noise, splitting it into three frequency bands with bandpass filters. The low end game from a bandpass at 80 Hz, the Mid body was around 600 Hz, and the high sizzling was 4000 Hz. They were all amplitude-modulated by a slow random signal, making the sound flicker and dip unpredictably. Random short bursts were also applied to simulate the crackling.

**Screenshot of WebAudio**
![alt text](<Screenshot 2026-04-20 001519.png>)