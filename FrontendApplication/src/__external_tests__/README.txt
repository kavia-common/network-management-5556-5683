This directory contains shim files that re-export tests from the top-level tests/ folder so that Create React App's Jest runner (which only discovers tests under src/) will execute them.

Each shim file simply imports the corresponding real test file under ../../tests/.
