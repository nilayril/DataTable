let prefers = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
let html = document.querySelector('html');
html.classList.add(prefers);
html.setAttribute('class', prefers);

const csvFileInput = document.getElementById('csvFileInput');
// document.querySelector("#csvFileInput");
csvFileInput.addEventListener("change", (e) => {
    papaParse(csvFileInput.files[0])
});

// const csvFileSelected = document.getElementById('selectFile');
// csvFileSelected.addEventListener("change", (ev) => {
//     // location.href=event.target.value;
//     $.get(ev.target.value, function (data) {
//         papaParse(data)
//     });
// });

function dropHandler(ev) {
    ev.preventDefault();

    if (ev.dataTransfer.items) {
        [...ev.dataTransfer.items].forEach((item, i) => {
            if (item.kind === "file") {
                papaParse(item.getAsFile());
            }
        });
    } else {
        [...ev.dataTransfer.files].forEach((file, i) => {
            console.log(`file[${i}].name = ${file.name}`);
        });
    }
}

function dragOverHandler(ev) {
    ev.preventDefault();
}

function papaParse(csvFile) {
    Papa.parse(csvFile, {
        worker: true,
        complete: function (result) {
            if (result.data && result.data.length > 0) {
                htmlTableGen(result.data)
            }
        }
    });
}

function htmlTableGen(content) {
    let csv_preview = document.getElementById('csvTable');
    let html = '<table id="tableData" class="table table-condensed table-hover table-striped cell-border hover order-column stripe display" style="width:100%">';

    if (content.length == 0 || typeof (content[0]) === 'undefined') {
        return null
    } else {
        const header = content[0];
        const data = content.slice(1);
        html += '<thead>';
        html += '<tr>';
        header.forEach(function (colData) {
            html += '<th>' + colData + '</th>';
        });
        html += '</tr>';
        html += '</thead>';
        html += '<tbody>';
        data.forEach(function (row) {
            if (header.length === row.length) {
                html += '<tr>';
                row.forEach(function (colData) {
                    html += '<td>' + colData + '</td>';
                });
                html += '</tr>';
            }
        });
        html += '</tbody>';
        html += '<tfoot>';
        html += '<tr>';
        header.forEach(function (colData) {
            html += '<th>' + colData + '</th>';
        });
        html += '</tr>';
        html += '</tfoot>';
        html += '</table>';
        csv_preview.innerHTML = html;
        initDataTable();
    }
}

function initDataTable() {
    $('#tableData').DataTable({
        scrollX: true,
        scrollY: '75vh',
        scrollCollapse: true,
        processing: true,
        pagingType: "full_numbers",
        keys: true,
        searchPanes: {
            layout: 'columns-3',
            initCollapsed: true,
            cascadePanes: true
        },
        language: {
            search: '',
            searchPlaceholder: 'Enter Search Query'
        },
        responsive: true,
        deferRender: true,
        buttons: [
            {
                extend: 'colvis',
                collectionTitle: 'Column Visibility Panel'
            },
            {
                extend: 'csv',
                text: '<i class="fa-solid fa-file-csv fa-xl" />',
                titleAttr: 'Download Data as CSV',
                exportOptions: {
                    columns: ':visible'
                }
            }
        ],
        initComplete: function () {
            this.api()
                .columns()
                .every(function () {
                    var column = this;
                    var title = column.footer().textContent;
                    $('<input type="text" placeholder="Search ' + title + '" />')
                        .appendTo($(column.footer()).empty())
                        .on('keyup change clear', function () {
                            if (column.search() !== this.value) {
                                column.search(this.value).draw();
                            }
                        });
                });
        },
        columnDefs: [
            {
                //targets: 1,
                render: function (data, type, row, meta) {
                    return '<a href="' + data + '">' + data + '</a>';
                }
            }
        ]
    })
}
