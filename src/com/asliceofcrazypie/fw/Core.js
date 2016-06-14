//#require libs.augment
//#require libs.functions

if( !this.ACPF ){
    ACPF = Object.augment( 
    function()
    {
        var classes = [];
        var packages = {com:{asliceofcrazypie:{fw:{Core:this}}}};
        var packageNames = {'com.asliceofcrazypie.fw':packages.com.asliceofcrazypie.fw};
        
        this.registerClass = function( className, packageName, body, parent )
        {
            //console.log( arguments, packages, packageNames );
            if( !( packageName instanceof Array ) )
            {
                var packageName = packageName.split( '.' );
            }
            
            var curPackage = packages, curPackageName;
            
            for( var i = 0, l = packageName.length; i < l; i++ )
            {
                curPackageName = packageName[i];
                
                if( !curPackage[curPackageName] )
                {
                    curPackage[curPackageName] = {};
                    
                    packageNames[packageName.slice( 0, i+1 ).join( '.' )] = curPackage[curPackageName];
                }
                
                curPackage = curPackage[curPackageName];
            }
            
            packageName = packageName.join( '.' );
            
            //get the parent
            if( !parent )
            {
                parent = Object;
            }
            else if( typeof( parent ) == 'string' )
            {
                //if not qualified assume same package, else assume 'global' package
                parent = ( parent.indexOf( '.' ) == -1 ) ? this.getClassByQualifiedName( packageName+'.'+parent ) || this.getClassByQualifiedName( parent ) : this.getClassByQualifiedName( parent );
            }
            
            var classObj = parent.augment( body );
            
            classObj.className = className;
            classObj.packageName = packageName;
            classObj.parentClass = parent;
            classObj.qualifiedName = ( packageName ? packageName+'.' : '' )+className;
            
            /*if( classObj.__preInit__ instanceof Function )
            {
                classObj.__preInit__();
            }*/
            
            classes.push( classObj );
            
            return curPackage[className] = classObj;
        }

        this.getClassByQualifiedName = function( name ){
            if( typeof( name ) == 'string' )
            {
                name = name.split( '.' );
            }
            else if( !name instanceof Array )
            {
                throw new Error( 'name must be an array or an array of strings' );
            }
            
            var className = name.pop();
            var packageObj = packageNames[name.join( '.' )];
            
            if( packageObj && packageObj[className] )
            {
                return packageObj[className];
            }
            
            return null;
        }

        this.getPackageByName = function ( name )
        {
            if( packageNames[name] )
            {
                return packageNames[name];
            }
            
            return null;
        }
        
        this.makeAutoPool = function( classObj, initSize, maxSize )
        {
            maxSize = maxSize || initSize;
            
            classObj._maxSize = maxSize;
            classObj._nextParam = '_next_'+classObj.packageName+'.'+classObj.className;
            classObj._prevParam = '_prev_'+classObj.packageName+'.'+classObj.className;
            classObj._available = 0;
            
            classObj.get = function(){
                var obj;
                
                if( this._current )
                {
                    this._available--;//record that pool has one less
                    obj = this._current;
                    this._current = obj[this._prevParam];
                    
                    //de link from current pool
                    if( this._current )
                    {
                        this._current[classObj._nextParam] = null;
                    }
                    
                    obj[this._prevParam] = obj[this._nextParam] = null;
                    
                }
                else//need to make a new object
                {
                    if( this._factory instanceof Function )
                    {
                        obj = this._factory();
                    }
                    else
                    {
                        obj = new this();
                    }
                }
                
                //add to in use pool
                if( this._inUse )
                {
                    obj[this._prevParam] = this._inUse;
                    this._inUse[this._nextParam] = obj;
                }
                
                this._inUse = obj;//record that this is in use
                
                return obj;
            }
            
            classObj.release = function( obj ){
                //remove from in use pool
                //-make obj's previous node use obj's next as it's next 
                if( obj[this._prevParam] )
                {
                    obj[this._prevParam][this._nextParam] = obj[this._nextParam];
                }
                
                //-make obj's next node use obj's previous as it's previous 
                if( obj[this._nextParam] )
                {
                    obj[this._nextParam][this._prevParam] = obj[this._prevParam];
                }
                
                obj[this._nextParam] = obj[this._prevParam] = null;//clear refs
                
                if( this._available >= this._maxSize )
                {
                    //pool full, dispose of this item
                    obj.dispose();
                }
                else
                {
                    //return to pool
                    this._available++;
                    
                    if( obj.reset instanceof Function )
                    {
                        obj.reset();
                    }
                    
                    //add to current pool
                    if( this._current )
                    {
                        //link this to current
                        obj[this._prevParam] = this._current;
                        this._current[this._nextParam] = obj;
                    }
                    
                    this._current = obj;
                }
                
                if( obj == this._inUse )
                {
                    this._inUse = null;
                }
            }
            
            classObj.releaseAll = function(){
                while( this._inUse )
                {
                    this.release( this._inUse );
                }
            }
            
            //TODO init the pool
            var obj;
            
            for( var i = 0; i < initSize; i++ )
            {
                if( classObj._factory instanceof Function )
                {
                    obj = classObj._factory();
                }
                else
                {
                    obj = new classObj();
                }
                
                if( classObj._current ){
                    classObj._current[classObj._nextParam] = obj;
                    obj[classObj._prevParam] = classObj._current;
                }
                
                classObj._current = obj;
            }
        }
        
        this.initClasses = function(){
            classes.forEach( function( classObj ){
                if( !classObj.__initied__ && typeof( classObj.__init__ ) == 'function' )
                {
                    classObj.__init__();
                    classObj.__initied__ = true;
                }
            })
        }
        
        this.noop = function(){}
    } );

}