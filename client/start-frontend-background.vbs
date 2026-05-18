Set WshShell = CreateObject("WScript.Shell")

' ====================================
' Frontend - Avtomatik Ishga Tushirish
' ====================================
'
' MUHIM: Quyidagi yo'lni admin kompyuteridagi 
' haqiqiy yo'lga o'zgartiring!
'
' Masalan:
' "C:\BM-CRM\client"
' "C:\Users\Admin\Documents\BM-CRM\client"
' "D:\Projects\BM-CRM\client"

WshShell.Run "cmd /c cd /d ""C:\BM-CRM\client"" && npm run dev", 0, False

Set WshShell = Nothing
