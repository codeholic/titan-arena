#!/bin/bash

yarn run tsc \
    src/jobs/*.ts \
    src/scripts/executeTransactionHandlers.ts \
    src/scripts/createGame.ts

ssh ubuntu@quests.titanarena.app pm2 stop titanarena
rsync -av --exclude=.next/cache .next ubuntu@quests.titanarena.app:titan-arena/

for file in .env.local $(find src -name \*.js); do
    scp $file ubuntu@quests.titanarena.app:titan-arena/$file
done

ssh ubuntu@quests.titanarena.app pm2 start titanarena
