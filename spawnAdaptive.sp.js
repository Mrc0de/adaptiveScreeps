// spawnAdaptive.sp

module.exports = {
    run(StructureSpawn) {
        let minWorkers = 6;
        let maxWorkers = 12; 
        // spawn report interval
        // init memory
        if (!StructureSpawn.memory.lastAnnounce) { StructureSpawn.memory.lastAnnounce = Game.time; }
        if (!StructureSpawn.memory.eSourceRoster) { StructureSpawn.memory.eSourceRoster = []; } // when a worker targets a source, append source to list, count occurences in list  = how many workers are assigned to it
        if ( StructureSpawn.memory.eSourceRoster ) {
            while ( StructureSpawn.memory.eSourceRoster[0] == null ) {
                StructureSpawn.memory.eSourceRoster.shift();
                if (StructureSpawn.memory.eSourceRoster.length == 0) {
                    break;
                } else {
                    if ( StructureSpawn.memory.eSourceRoster[0] != null ) {
                        break;
                    }
                }
            }
        }
        if (!StructureSpawn.memory.eSourceTotalSpots) { StructureSpawn.memory.eSourceTotalSpots = 0; } // how many unobstructed mining spots are there total?
        // Find all e-Sources
        let eSourceList = Game.rooms[StructureSpawn.room.name].find(FIND_SOURCES);
        let extensions = Game.rooms[StructureSpawn.room.name].find(FIND_MY_STRUCTURES,{filter: { structureType : STRUCTURE_EXTENSION } });
        let bodies = { WORKER:[WORK,CARRY,MOVE] };
        let willSpawnNow = false;
        
        if ( Game.time > ( StructureSpawn.memory.lastAnnounce + (10) ) ) {
            console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n");
            StructureSpawn.memory.lastAnnounce = Game.time;
            console.log(StructureSpawn.name +": Spawn Report");
            console.log("Room: " + StructureSpawn.room.name );
            console.log(StructureSpawn.name +": Energy/Max - "+StructureSpawn.energy+'/'+StructureSpawn.energyCapacity);
            console.log("Total eSources: " + eSourceList.length);
            console.log("Total Extensions: " + extensions.length);
            console.log("Total Available Energy (Extensions): " + StructureSpawn.room.energyAvailable);
            
            // Announce Screep Lifespans
            let dedCreepz = "CreepName -> TicksToLive\n";
            let cnt = 1;
            for(var creepz in Game.creeps) {
                if ( Game.creeps[creepz].spawning ) { continue;}
                dedCreepz += creepz +" -> " +Game.creeps[creepz].ticksToLive + "\t";
                if ( !(cnt % 6) ) { dedCreepz += "\n"; }
                cnt++;
            }
            console.log(dedCreepz);
            let workersThisRoom = Game.rooms[StructureSpawn.room.name].find(FIND_MY_CREEPS,{filter: { memory: { bodyType: 'worker' } } }).length;
            console.log("Workers in this room: "+ workersThisRoom);
            
            if ( workersThisRoom < minWorkers && !StructureSpawn.spawning && StructureSpawn.room.energyAvailable > 199 && !willSpawnNow ) {
                console.log(StructureSpawn.name +": Creating worker Creep ("+workersThisRoom+ " Exist)");
                StructureSpawn.createCreep(bodies['WORKER'],null);
                willSpawnNow = true;
            } else {
                console.log("No Spawn Reason - Spawning: " + StructureSpawn.spawning + " Eavail: " + StructureSpawn.room.energyAvailable + " willSpawnNow: " + willSpawnNow);
            }
            
            
            if ( workersThisRoom < maxWorkers && !StructureSpawn.spawning && StructureSpawn.room.energyAvailable > 199 && !willSpawnNow ) {
                console.log(StructureSpawn.name +": Creating worker Creep ("+workersThisRoom+ " Exist)");
                StructureSpawn.createCreep(bodies['WORKER'],null);
                willSpawnNow = true;
            } else {
                console.log("No Spawn2 Reason - Spawning: " + StructureSpawn.spawning + " Eavail: " + StructureSpawn.room.energyAvailable + " willSpawnNow: " + willSpawnNow);
            }
            
            //no longer needed.
            // var harvestersThisRoom = Game.rooms[StructureSpawn.room.name].find(FIND_MY_CREEPS,{filter: { memory :{ role: 'harvester'} }}).length;
            // var upgradersThisRoom = Game.rooms[StructureSpawn.room.name].find(FIND_MY_CREEPS,{filter: { memory :{ role: 'upgrader'} }}).length;
            // var baseBuildersThisRoom = Game.rooms[StructureSpawn.room.name].find(FIND_MY_CREEPS,{filter: { memory :{ role: 'baseBuilder'} }}).length;
            
            // console.log("Harvesters in this room: "+ harvestersThisRoom);
            // console.log("Upgraders in this room: "+ upgradersThisRoom);
            // console.log("Builders in this room: "+ baseBuildersThisRoom);
            // if ( StructureSpawn.canCreateCreep(bodies['HARVEST1']) == OK && (StructureSpawn.spawning == null && harvestersThisRoom < maxHarvesters && 
            //         upgradersThisRoom > minUpgraders && baseBuildersThisRoom > minBaseBuilders) || StructureSpawn.canCreateCreep(bodies['HARVEST1']) == OK && harvestersThisRoom < minHarvesters ) {
            //     console.log(StructureSpawn.name +": Creating Harvester Role Creep ("+harvestersThisRoom+ " Exist)");
            //     StructureSpawn.createCreep(bodies['HARVEST1'],null,{role:'harvester'});
            // } else if ( StructureSpawn.canCreateCreep(bodies['UPGRADE1']) == OK && StructureSpawn.spawning == null && upgradersThisRoom < maxUpgraders &&
            //         baseBuildersThisRoom > minBaseBuilders ) {
            //     console.log(StructureSpawn.name +": Creating Upgrader Role Creep");
            //     StructureSpawn.createCreep(bodies['UPGRADE1'],null,{role:'upgrader'});
            // } else if ( StructureSpawn.canCreateCreep(bodies['BUILDER1']) == OK && StructureSpawn.spawning == null && baseBuildersThisRoom < maxBaseBuilders ) {
            //     console.log(StructureSpawn.name +": Creating baseBuilder Role Creep");
            //     StructureSpawn.createCreep(bodies['BUILDER1'],null,{role:'baseBuilder'});
            // } else {
            //     console.log("Total Available Energy: " + StructureSpawn.room.energyAvailable);
            //     if ( StructureSpawn.spawning ) { console.log("Currently Spawning: "+ StructureSpawn.spawning.name ); }
            //     console.log(StructureSpawn.name + ": Not making a damn thing..");
            // }
            console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n");
        }
        
    }
};