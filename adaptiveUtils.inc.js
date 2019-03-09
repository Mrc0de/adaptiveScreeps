// Utils
module.exports = {    
    // get distance between 2 things
    distance(thingOne,thingTwo,verbose=0) {
        let report = "___\nThingOne: "+thingOne+"\nThingTwo: "+thingTwo+"\n___";
        let retVal = thingOne.pos.RangeTo(thingTwo);
        //before return, report if verbose
        if ( verbose ) {
            console.log(report);
            console.log("Distance: "+ retVal);
        }
        return retVal;
    },
    // Detect the creeps body type by examine its parts
    detectBodyType(creep) {
        //worker, soldier, scout, or invader
        //if unknown, return worker
        let retVal = 'worker';
        return retVal;
    },
    // Determine a 'worker' creeps current role
    // Only for worker types (or worker variants)
    determineRole(creep) {
      let retVal = 'standby';
      return retVal;
    },
    // Figure out how many spots surrounding eSource can actually be used
    findMaxMiningSpotsOnSource(eSource) {
        let retVal = 0;
        // spin round each adjacent, check for obstructed (creeps dont count as obstructed)
        var lPos = new RoomPosition(eSource.pos.x -1, eSource.pos.y, eSource.room.name); //W
        var ldPos = new RoomPosition(eSource.pos.x -1, eSource.pos.y-1, eSource.room.name); //SW
        var dPos = new RoomPosition(eSource.pos.x, eSource.pos.y-1, eSource.room.name); //S
        var rdPos = new RoomPosition(eSource.pos.x+1, eSource.pos.y-1, eSource.room.name); //SE
        var rPos = new RoomPosition(eSource.pos.x+1, eSource.pos.y, eSource.room.name); //E
        var ruPos = new RoomPosition(eSource.pos.x+1, eSource.pos.y+1, eSource.room.name); //NE
        var uPos = new RoomPosition(eSource.pos.x, eSource.pos.y+1, eSource.room.name); //N
        var luPos = new RoomPosition(eSource.pos.x-1, eSource.pos.y+1, eSource.room.name); //NW
        var hit = 0;
        //Roads are exempt because we can stand on them while mining
        if ( lPos.lookFor(LOOK_TERRAIN).length != 0 && lPos.lookFor(LOOK_STRUCTURES).length == 0 ) {
            if (Game.map.getTerrainAt(lPos) != "wall") {retVal++;}
        } else if ( lPos.lookFor(LOOK_STRUCTURES).length > 0 ) {
            for(var st in lPos.lookFor(LOOK_STRUCTURES) ) {
                if (lPos.lookFor(LOOK_STRUCTURES)[st].structureType == STRUCTURE_ROAD ) { retVal++; }
            }
        }
        if ( ldPos.lookFor(LOOK_TERRAIN).length != 0 && ldPos.lookFor(LOOK_STRUCTURES).length == 0 ) {
            if (Game.map.getTerrainAt(ldPos) != "wall") { retVal++; }
        } else if ( ldPos.lookFor(LOOK_STRUCTURES).length > 0 ) {
            for(var st in ldPos.lookFor(LOOK_STRUCTURES) ) {
                if (ldPos.lookFor(LOOK_STRUCTURES)[st].structureType == STRUCTURE_ROAD ) { retVal++; }
            }
        }
        if ( dPos.lookFor(LOOK_TERRAIN).length != 0 && dPos.lookFor(LOOK_STRUCTURES).length == 0 ) {
            if (Game.map.getTerrainAt(dPos) != "wall") {retVal++;}
        } else if ( dPos.lookFor(LOOK_STRUCTURES).length > 0 ) {
            for(var st in dPos.lookFor(LOOK_STRUCTURES) ) {
                if (dPos.lookFor(LOOK_STRUCTURES)[st].structureType == STRUCTURE_ROAD ) { retVal++; }
            }
        }
        if ( rdPos.lookFor(LOOK_TERRAIN).length != 0 && rdPos.lookFor(LOOK_STRUCTURES).length == 0 ) {
            if (Game.map.getTerrainAt(rdPos) != "wall") {retVal++;}
        } else if ( rdPos.lookFor(LOOK_STRUCTURES).length > 0 ) {
            for(var st in rdPos.lookFor(LOOK_STRUCTURES) ) {
                if (rdPos.lookFor(LOOK_STRUCTURES)[st].structureType == STRUCTURE_ROAD ) { retVal++; }
            }
        }
        if ( rPos.lookFor(LOOK_TERRAIN).length != 0 && rPos.lookFor(LOOK_STRUCTURES).length == 0 ) {
            if (Game.map.getTerrainAt(rPos) != "wall") {retVal++;}
        } else if ( rPos.lookFor(LOOK_STRUCTURES).length > 0 ) {
            for(var st in rPos.lookFor(LOOK_STRUCTURES) ) {
                if (rPos.lookFor(LOOK_STRUCTURES)[st].structureType == STRUCTURE_ROAD ) { retVal++; }
            }
        }
        if ( ruPos.lookFor(LOOK_TERRAIN).length != 0 && ruPos.lookFor(LOOK_STRUCTURES).length == 0 ) {
            if (Game.map.getTerrainAt(ruPos) != "wall") {retVal++;}
        } else if ( ruPos.lookFor(LOOK_STRUCTURES).length > 0 ) {
            for(var st in ruPos.lookFor(LOOK_STRUCTURES) ) {
                if (ruPos.lookFor(LOOK_STRUCTURES)[st].structureType == STRUCTURE_ROAD ) { retVal++; }
            }
        }
        if ( uPos.lookFor(LOOK_TERRAIN).length != 0 && uPos.lookFor(LOOK_STRUCTURES).length == 0 ) {
            if (Game.map.getTerrainAt(uPos) != "wall") {retVal++;}
        } else if ( uPos.lookFor(LOOK_STRUCTURES).length > 0 ) {
            for(var st in uPos.lookFor(LOOK_STRUCTURES) ) {
                if (uPos.lookFor(LOOK_STRUCTURES)[st].structureType == STRUCTURE_ROAD ) { retVal++; }
            }
        }
        if ( luPos.lookFor(LOOK_TERRAIN).length != 0 && luPos.lookFor(LOOK_STRUCTURES).length == 0 ) {
            if (Game.map.getTerrainAt(luPos) != "wall") {retVal++;}
        } else if ( luPos.lookFor(LOOK_STRUCTURES).length > 0 ) {
            for(var st in luPos.lookFor(LOOK_STRUCTURES) ) {
                if (luPos.lookFor(LOOK_STRUCTURES)[st].structureType == STRUCTURE_ROAD ) { retVal++; }
            }
        }
        return retVal;
    },
    // If body type can harvest, assume harvester role and start action
    // Takes Creep
    findHarvestOpportunity(creep) {
        let r = creep.room;
        let spawn = r.find(FIND_MY_SPAWNS);
        for (var n in spawn) {
            spawn = spawn[n];
            break;
        }
        //get complete list of eSources
        let eSources = r.find(FIND_SOURCES);
        for(var s in eSources) {
            let maxSpots = this.findMaxMiningSpotsOnSource(eSources[s]);
            let usedSpots = 0;
            //console.log("<fHO> eSource: " + eSources[s].id + "\t Amount: " + eSources[s].energy + "\t Spots: " + maxSpots);
            if ( spawn.memory.eSourceRoster.length > 0 ) {
                for (var z in spawn.memory.eSourceRoster) {
                    // console.log("z = " + spawn.memory.eSourceRoster[z] );
                    // console.log("id = " + eSources[s].id );
                    if ( spawn.memory.eSourceRoster[z] == eSources[s].id ) {
                        usedSpots++;
                    }
                }
            }
           //console.log(creep.name + ": <fHO> eSource: " + eSources[s].id + "\t Amount: " + eSources[s].energy + "\t Free Spots: " + usedSpots +"/"+maxSpots);
            //console.log("<fHO> usedSpots: " + usedSpots);
            if ( usedSpots < maxSpots ) {
                return eSources[s];
            }
        }
        return 'none';
    },
    // If body type can build, assume builder role and start building
    // DO NOT ATTEMPT TO HARVEST
    // PULL RESOURCES FROM EXTENSIONS/STORAGE ONLY
    // Takes Creep 
    findBuildOpportunity(creep) {
        if ( !creep ) { return 'none'; }
        let r = creep.room;
        let conSites = r.find( FIND_MY_CONSTRUCTION_SITES );
        if ( conSites.length > 0 ) {
            return this.chooseClosest(conSites,creep);
        } else {
            return 'none';
        }
    },
    // If body type can repair, assume repair role and start repairing
    // DO NOT ATTEMPT TO HARVEST
    // PULL RESOURCES FROM EXTENSIONS/STORAGE ONLY
    // Takes Creep
    findRepairOpportunity(creep) {
        if ( !creep ) { return 'none'; }
        let r = creep.room;
        let repStruc = r.find( FIND_STRUCTURES, {
           filter: (i) => i.hits < (i.hitsMax / 4)
        });
        let filtered = [];
        let blah = filtered.pop();
        if ( repStruc.length > 0 ) {
            for ( var rs in repStruc ) {
                if ( repStruc[rs].structureType == STRUCTURE_WALL || repStruc[rs].structureType == STRUCTURE_RAMPART ) {
                    if ( repStruc[rs].hits < 5000 ) {
                        filtered.push( repStruc[rs] );
                        //console.log('Wall Needs Fixin: ' + repStruc[rs].hits+"/"+ repStruc[rs].hitsMax );
                    }
                } else {
                    filtered.push( repStruc[rs] );
                }
            }
            if ( filtered.length > 0 ) {
                //console.log(creep.name + ": " + filtered.length + " Structures Need Repairs.");
                return this.chooseClosest(filtered,creep);
            } else { return 'none'; }
        } else {
            return 'none';
        }
    },
    findStorageNotEmpty(creep) {
        if ( !creep ) { return 'none'; }
        let r = creep.room;
        let storage = r.find( FIND_STRUCTURES, {
            filter: (i) => i.structureType == STRUCTURE_CONTAINER && i.store[RESOURCE_ENERGY] > 0 || (i.structureType == STRUCTURE_STORAGE && i.store[RESOURCE_ENERGY] > 0 )
        });
        if ( storage.length > 0 ) {
            //console.log(creep.name + ": " + storage.length + " Non-Empty Storage Structures.");
            return this.chooseClosest(storage,creep);
        } else {
            return 'none';
        }
    },
    findStorageNotFull(creep) {
        if ( !creep ) { return 'none'; }
        let r = creep.room;
        let storage = r.find( FIND_STRUCTURES, {
            filter: (i) => (i.structureType == STRUCTURE_CONTAINER  && i.store[RESOURCE_ENERGY] < i.storeCapacity) || (i.structureType == STRUCTURE_EXTENSION && i.energy < i.energyCapacity) || (i.structureType == STRUCTURE_TOWER && i.energy < i.energyCapacity) || (i.structureType == STRUCTURE_STORAGE && i.store[RESOURCE_ENERGY] < i.storeCapacity )
        });
        if ( storage.length > 0 ) {
            //console.log(creep.name + ": " + storage.length + " Non-Full Storage Structures.");
            return this.chooseClosest(storage,creep);
        } else {
            return 'none';
        }
    },
    chooseClosest(targets,creep) {
        if ( !creep ) { return 'none'; }
        //Choose Closest of target. No Exceptions.
        let choiceA = targets[0];
        let choice = choiceA;
        for(var t in targets) {
            choiceA = choice;
            if ( targets[t] == choiceA ) { continue;}
            let choiceB = targets[t];
            // console.log(creep.name+"~~~\n"+creep.name+": Choice A: "+choiceA);
            // console.log(creep.name+": Choice B:"+ choiceB);
            let rangeA = creep.pos.getRangeTo(choiceA);
            let rangeB = creep.pos.getRangeTo(choiceB);
            // console.log(creep.name+": Choice A RangeTo Creep: "+rangeA);
            // console.log(creep.name+": Choice B RangeTo Creep: "+rangeB);
            choice = rangeA < rangeB ? choiceA : choiceB;
            // console.log(creep.name+": Closest is "+ choice+"\n~~~\n");
        }
        // console.log(chosen+" is closest");
        return choice;
    },
    //GENERAL REPORT FOR OBJECT
    report(thing) {
        var report = "";
        report += "---------------\n";
        report += "---------------\n";
        report += "Report For "+  thing + "\n";
        report += "ID: " + thing.id + "\n";
        report += "Room: "+ thing.room.name + "\n";
        if (thing.structureType != null) {
            report += "Type: STRUCTURE\n";
        } else if ( thing instanceof Creep ) {
            report += "Type: CREEP\n";
            report += "Name: " + thing.name + "\n";
            report += "Body: [";
            for(var b in thing.body ) {
                report += " " + thing.body[b].type + " ";
            }
            report += "]\n";
            report += "ticksToLive: "+ thing.ticksToLive + "\n";
            report += "Carrying Energy: "+ thing.carry.energy + "/" + thing.carryCapacity + "\n";
            report += "Owner: "+ thing.owner.username + "\n";
            report += "------\nMEMORY\n-----\n"
            report += "role: " + thing.memory.role + "\n";
            report += "state: " + thing.memory.state + "\n";
            report += "task: " + thing.memory.task + "\n";
        }
        report += "~~~~~~~~~~\n";
        report += "STRINGIFIED:\n" + JSON.stringify(thing) + "\n";
        report += "~~~~~~~~~~\n";
        report += "STRINGIFIED Memory:\n" + JSON.stringify(thing.memory ) + "\n";
        report += "~~~~~~~~~~\n";
        console.log(report);
    }      
};