'use strict';

(function() {

    $(document).on('click', '.downloadGrades', function(evt) {

        var item = $(this).parent();
        var id = item.data('mcq-id');

        flipper.submission.get( { mcq_id: id} , function(err, grades) {
            if ( err ) {
                console.error( err );
                toastr.error( err );
            } else {
                var gradesCSV = 'Name,Grade\n';

                var names = Object.keys(grades);

                names.forEach( function( name ) {
                    gradesCSV += name + ',' + grades[name] + "\n";
                });

                var fileName = 'export.csv';
                gradesCSV = 'data:text/csv;charset=utf-8,' + gradesCSV;

                data = encodeURI(gradesCSV);

                var link = document.createElement('a');
                link.setAttribute('href', data);
                link.setAttribute('download', fileName);
                link.click();

            }
        } )
    })
})();