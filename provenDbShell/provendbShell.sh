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
  exit 1
fi

#
# Check mongoDB shell version
#
VERSTR=`mongo -version|grep 'shell version'`
if [[ $VERSTR =~ version\ v([234]).([0-9]).* ]];then 
  MAJOR_VERSION=${BASH_REMATCH[1]}
  MINOR_VERSION=${BASH_REMATCH[2]}
elif  [[ $VERSTR =~ version:\ ([234]).([0-9]).* ]];then 
  MAJOR_VERSION=${BASH_REMATCH[1]}
  MINOR_VERSION=${BASH_REMATCH[2]}
else
  echo "Cannot determine mongodb shell version"
  exit 1
fi

if [ $MAJOR_VERSION -lt 4 -a $MINOR_VERSION -lt 6 ];then
  echo "Require mongoDB shell 3.6 or above - you have ${MAJOR_VERSION}.${MINOR_VERSION}"
  exit 1
fi 

echo ProvenDB shell helper
mongo $*  $PROVENDB_SHELL_JS --shell --quiet

 