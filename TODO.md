# TODOs

#### Small

_2018-04-05_

* [👌] Get ETAs for a favorite stop from API
* [👌] Show favorite stops in `dashboard`
* [ ] Make dashboard default screen if there's already favorite stops in the database. The easiest way would be making the `dashboard` screen the default screen, and check in the dashboard if there are favorites, if not, redirect to the `start` screen.
* [ ] Update markers
  * [ ] Update stop markers in `lineMap` to something that looks like a bus stop.
  * [ ] Update stop markers for `dashboard` favorite card to something that looks like a bus stop.
  * [ ] Update bus markers for `dashboard` favorite card to something that looks like a bus. If there's a way to show the line number, that's better.
* [ ] Show already selected stops in `lineMap` (color the already selected ones)

---

### Medium

_2018-04-05_

* [ ] Confirm that selected line in `selectMap` screen actualy exists. When confirming the line value, check first in the database if exists a line with that name. Query would be like this:

  ```sql
  select exists (select 1 from recorridos where desc_linea = 'L2' limit 1);
  ```

* [ ] Long-press favorite card to pop up a dialog to ask if you want to delete it or not
  * [ ] Add delete method in `LightSTM` API to delete favorites (the row key is composed by `COD_UBIC_P` and `DESC_LINE`)
  * [ ] Delete all rows in `favorites` table with the StopID of the favorite card being pressed

---

## Epics

_2018-04-05_

* [ ] Create detailed favorite stop map view
  * [ ] Open complete map view with stop marker and all buses updating in real time
  * [ ] Make positions update every 15 seconds
  * [ ] Tilt map towards direction of the buses
* [ ] Make suggestions in line selection in `lineMap` screen.
