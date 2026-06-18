@echo off
title MuscleUp Gym - WhatsApp Bot
echo ===================================================
echo Starting WhatsApp Bot for MuscleUp Gym...
echo Please wait while the system initializes.
echo ===================================================
cd /d "%~dp0whatsapp-bot"
node bot.js
pause
