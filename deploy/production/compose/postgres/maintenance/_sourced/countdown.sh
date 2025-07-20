#!/usr/bin/env bash
# deploy/production/compose/postgres/maintenance/_sourced/countdown.sh


countdown() {
    declare desc="A simple countdown. Source: https://superuser.com/a/611582"
    local seconds="${1}"
    local d=$(($(date +%s) + "${seconds}"))
    while [ "$d" -ge `date +%s` ]; do
        echo -ne "$(date -u --date @$(($d - `date +%s`)) +%H:%M:%S)\r";
        sleep 0.1
    done
}
