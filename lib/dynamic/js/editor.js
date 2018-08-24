var graph = new joint.dia.Graph;
var paper = new joint.dia.Paper({
  el: document.getElementById('myholder'),
  model: graph,
  width: 600,
  height: 500,
  gridSize: 1
});

var el1 = new joint.shapes.standard.Rectangle({
  position: { x: 50, y: 50 },
  size: { width: 100, height: 40 },
  attrs: {
    body: {
      strokeWidth: 5,
      strokeOpacity: .7,
      stroke: 'black',
      rx: 3,
      ry: 3,
      fill: 'lightgray',
      fillOpacity: .5
    },
    label: {
      text: 'Drop me over Kitchen',
      fontSize: 10,
      style: { 'text-shadow': '1px 1px 1px lightgray' }
    }
  }
});

var el2 = el1.clone().translate(200, 50).attr('label/text', 'Kitchen');
var el3 = el1.clone().translate(100, 150).attr('label/text', 'Bathroom');
graph.addCells([el1, el2, el3]);

paper.on({

  'element:pointerdown': function(elementView, evt) {

    evt.data = elementView.model.position();
    var Name = elementView.model.attributes.attrs.label.text;

    console.log(Name);

    //update Highlighting
    paper.findViewsInArea(paper.getArea()).forEach(cell => {
      cell.unhighlight();
    });
    elementView.highlight();

    //Title Update
    $( "#CurSelect" ).text("Selected: " + Name);
    //Room option update
    var exists = false;
    $('#Room option').each(function(){
      if (this.value == Name) {
        exists = true;
        return false;
      }
    });
    if (exists){
      $("#Room option[value='"+Name+"']").prop('selected', true);
    }else {
      $("#Room option[value='N/A']").prop('selected', true);
    }
  },

  'element:pointerup': function(elementView, evt, x, y) {

    var coordinates = new g.Point(x, y);
    var elementAbove = elementView.model;
    var elementBelow = this.model.findModelsFromPoint(coordinates).find(function(el) {
      return (el.id !== elementAbove.id);
    });

    // If the two elements are connected already, don't
    // connect them again (this is application-specific though).
    if (elementBelow && graph.getNeighbors(elementBelow).indexOf(elementAbove) === -1) {

      // Move the element to the position before dragging.
      elementAbove.position(evt.data.x, evt.data.y);

      // Create a connection between elements.
      var link = new joint.shapes.standard.Link();
      link.source(elementAbove);
      link.target(elementBelow);
      link.addTo(graph);
      console.log("Connecting " + link.getSourceElement().attributes.attrs.label.text + " and "+ link.getTargetElement().attributes.attrs.label.text);

      // Add remove button to the link.
      var tools = new joint.dia.ToolsView({
        tools: [new joint.linkTools.Remove()]
      });
      link.findView(this).addTools(tools);
    }
  }



  //end of paper
});


///////////////////////////////Non Canvas JS
function UpdateList() {
  var allElement = graph.getElements();
  var dict = {};

  allElement.forEach(elem => {
    var textVal = elem.attributes.attrs.label.text;
    if(textVal in dict) {
      dict[textVal] = dict[textVal] + 1;
    }else {
      dict[textVal] = 1;
    }
  });

  for(var key in dict) {
    var value = dict[key];
    console.log(key + " " + value );

    makeTag=function(openTag, closeTag){
      return function(content){
        return openTag+content+closeTag;
      };
    };
    var tHead=makeTag("<thead>","</thead>");
    var tBody=makeTag("<tbody>","</tbody>");
    var td=makeTag("<td>","</td>");
    var tr=makeTag("<tr>","</tr>");

    function insertBasicTable(data,id){
      $('#'+id).html(
        tHead(
          tr(
            td("Room")+
            td("#")
          )
        )+
        tBody(
          Object.keys(data).reduce(function(o,n){
            return o+tr(
              td(n)+""+
              td(data[n]+"")
            );
          },"")
        )
      );
    };
    insertBasicTable(dict,"RoomList");





  }
}

$( "#Editor" ).submit(function( event ) {
  event.preventDefault();
  var allElement = graph.getElements();

  allElement.forEach(elem => {
    var textVal = elem.attributes.attrs.label.text;
    //console.log(textVal);
    //console.log("comparing " + textVal + " and " + $('#CurSelect').text().replace('Selected: ',''));
    if(textVal !== undefined && textVal === $('#CurSelect').text().replace('Selected: ','')) {

      elem.attr('label/text', $("#Room option:selected").val());
      $( "#CurSelect" ).text("Selected: " + elem.attr('label/text'));
    }
  });
  UpdateList();
});


$( "#Add" ).submit(function( event ) {
  event.preventDefault();
  if ($("#AddRoom option:selected").val() != "N/A"){
    var temp = el1.clone().translate(paper.options.width/2, paper.options.height/2).attr('label/text', $("#AddRoom option:selected").val());
    graph.addCells(temp);
    UpdateList();
  }else {
    alert("Please select a room");
  }
});
