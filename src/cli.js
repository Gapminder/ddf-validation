#!/bin/sh
":" //# comment; exec /usr/bin/env node --max-old-space-size=8192 "$0" "$@"

'use strict';

require('../lib/cli-logic');
