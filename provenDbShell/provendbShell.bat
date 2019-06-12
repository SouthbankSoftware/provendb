@echo off
rem 
rem provendbShell - wrapper around mongo shell for Provendb 

rem Copyright (C) 2019  Southbank Software Ltd.
rem
rem This program is free software: you can redistribute it and/or modify
rem it under the terms of the GNU Affero General Public License as published by
rem the Free Software Foundation, either version 3 of the License, or
rem (at your option) any later version.
rem
rem This program is distributed in the hope that it will be useful,
rem but WITHOUT ANY WARRANTY; without even the implied warranty of
rem MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
rem GNU Affero General Public License for more details.
rem
rem You should have received a copy of the GNU Affero General Public License
rem along with this program.  If not, see <http://www.gnu.org/licenses/>.
rem
rem @Author: Guy Harrison 
rem
set PDBJS=provendbShell.js
if "%1"=="" (
    @echo Usage: provendbShell ProvenDbUri [mongo shell arguments]
    exit /b 1
)
 
if not defined PROVENDB_HOME (set PROVENDB_HOME=.)
rem Look in current directory
if exist .\%PDBJS% (set SCRIPTLOC=.\%PDBJS%
) else (

   rem Look in PROVENDB_HOME
    if exist %PROVENDB_HOME%\%PDBJS% (set SCRIPTLOC= %PROVENDB_HOME%\%PDBJS% 
    ) else (

   rem Look everywhere in the path
    for %%G in ("%path:;=" "%") do if exist %%G\%PDBJS% (set SCRIPTLOC=%%G\%PDBJS% )
    )
) 
@echo ProvenDB shell helper
if not defined SCRIPTLOC (
    @echo Cannot find %PDBJS% in path
) else (
    mongo %* --shell --quiet --ssl %SCRIPTLOC%
)