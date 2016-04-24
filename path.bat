REM PATH1
SET PATH1=C:\Users\hagb4rd\AppData\Roaming\Microsoft\Windows\Start Menu\Programs;C:\Windows;C:\Windows\system32;C:\Windows\System32\Wbem;C:\Windows\System32\WindowsPowerShell\v1.0;C:\nodejs;C:\Users\hagb4rd\AppData\Roaming\npm;S:\#shell;S:\Tools\PortableGit\bin;S:\tools\PortableGit\cmd;S:\tools\PortableGit\usr\bin;S:\tools\MongoDB\bin;S:\tools\mongodb;S:\tools;S:\#shell\PS;C:\DevKit\bin;C:\GTK\bin;C:\PYTHON27;C:\msys64;C:\Users\hagb4rd\AppData\Local\atom\bin;C:\ProgramFiles(x86)\IISExpress;C:\ProgramFiles(x86)\PHP\v5.6;C:\Windows\Microsoft.NET\Framework64\v3.5;C:\Windows\Microsoft.NET\Framework64\v4.0.30319;C:\Windows\Microsoft.NET\Framework\v4.0.30319;C:\ProgramFiles(x86)\MSBuild\12.0\bin;C:\ProgramFiles(x86)\MicrosoftSDKs\Windows\v7.0A\bin;C:\ProgramFiles(x86)\MicrosoftSDKs\Windows\v7.0A\bin\NETFX4.0Tools\x64;C:\ProgramFiles(x86)\MicrosoftSDKs\Windows\v7.0A\bin\x64;C:\vs2013\VC\BIN;C:\vs2013\VC\VCPackages;C:\vs2013\Common7\IDE;C:\vs2013\Common7\Tools;S:\tools\ImageMagick;C:\Program Files (x86)\Microsoft VS Code\bin
REM SET PATH=%PATH1%
SETX PATH1 "%PATH1%"
SETX PATH "%PATH1%"
pause

REM PATH2
SET PATH2=C:\vs2013\Common7\IDE\CommonExtensions\Microsoft\TestWindow;C:\Program Files (x86)\Microsoft SDKs\F#\3.1\Framework\v4.0\;C:\Program Files (x86)\Microsoft SDKs\TypeScript\1.0;C:\Program Files (x86)\MSBuild\12.0\bin;C:\vs2013\Common7\IDE\;C:\vs2013\VC\BIN;C:\vs2013\Common7\Tools;C:\Windows\Microsoft.NET\Framework\v4.0.30319;C:\vs2013\VC\VCPackages;C:\Program Files (x86)\HTML Help Workshop;C:\vs2013\Team Tools\Performance Tools;C:\Program Files (x86)\Windows Kits\8.1\bin\x86;C:\Program Files (x86)\Microsoft SDKs\Windows\v8.1A\bin\NETFX 4.5.1 Tools\;C:\Program Files (x86)\Microsoft SDKs\F#\3.1\Framework\v4.0\;C:\Program Files (x86)\Microsoft SDKs\TypeScript\1.0;C:\Program Files (x86)\MSBuild\12.0\bin;C:\vs2013\Common7\IDE\;C:\vs2013\VC\BIN;C:\vs2013\Common7\Tools;C:\Windows\Microsoft.NET\Framework\v4.0.30319;C:\vs2013\VC\VCPackages;C:\Program Files (x86)\Windows Kits\8.1\bin\x86;C:\Program Files (x86)\Microsoft SDKs\Windows\v8.1A\bin\NETFX 4.5.1 Tools\
SET PATH=%PATH1%;%PATH2%
SETX PATH2 "%PATH2%"
SETX PATH -m "%PATH2%"
pause