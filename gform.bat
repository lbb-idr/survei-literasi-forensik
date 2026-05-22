@echo off
REM GForm Creator - shortcut untuk create_form.py
REM Usage: gform < survey.txt
REM        gemini prompt ... | gform
REM        gform --file survey.txt
REM        gform "TITLE=..."

python "%~dp0create_form.py" %*
