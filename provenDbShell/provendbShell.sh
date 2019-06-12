# 
# provendbShell - wrapper around mongo shell for Provendb 

# Copyright (C) 2019  Southbank Software Ltd.
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
# @Author: Guy Harrison 
#
PDBJS="provendbShell.js"
if [ "$#" -eq 0 ];then
  echo "Usage: provendbShell ProvenDbUri [mongo shell arguments]"
  exit 1
fi

if [ "$PROVENDB_HOME" != "" ]; then # If Home is set, look only in HOME 
  if [ -e "${PROVENDB_HOME}/${PDBJS}" ];then 
      export PROVENDB_SHELL_JS="${PROVENDB_HOME}/${PDBJS}" 
  fi
else
  if [ -e "./${PDBJS}" ];then #Check current directory 
    export PROVENDB_SHELL_JS="./${PDBJS}"
  else
    IFS=: read -r -d '' -a path_array < <(printf '%s:\0' "$PATH") #array of paths
    for path in "${path_array[@]}"; do # Check everywhere in path 
      if [ -e "${path}/${PDBJS}" -a "$PROVENDB_SHELL_JS" = "" ];then
        export PROVENDB_SHELL_JS="${path}/${PDBJS}"
      fi
    done 
  fi
fi

if [ "$PROVENDB_SHELL_JS" = "" ];then
  echo "Error: Cannot file $PDBJS in path"
  exit 1
fi

WHICHMONGO=`which mongo`; 
if [ "$WHICHMONGO" = "" ];then
  echo "Can't find mongo shell in path: Please install mongo client"
else
  echo ProvenDB shell helper
  mongo $*  $PROVENDB_SHELL_JS --shell --quiet
fi
 