Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "cmd /c cd /d ""f:\oqava suv\server"" && npm start", 0, False
Set WshShell = Nothing
