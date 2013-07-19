var totalRSVP = 0,
	rsvps = [],
	members = [],
	totalMembers = [];
	<c:forEach var="row" items="${members}" varStatus="ind">
		members.push({
			"x": new Date('${row.day}').getTime() / 1000,
			"y": ${row.activeMemberCount}
		});
		// ${row.activeMemberCount}
	</c:forEach>
	<c:forEach var="row" items="${members}" varStatus="ind">
		totalMembers.push({
			"x": new Date('${row.day}').getTime() / 1000,
			"y": ${row.memberCount}
		});
		// ${row.activeMemberCount}
	</c:forEach>
	<c:forEach var="row" items="${rsvps}" varStatus="ind">
		totalRSVP += ${row.count};
		rsvps.push({
			"x": new Date('${row.day}').getTime() / 1000,
			"y": ${row.count}
		});
	</c:forEach>
// web.values.report = members, rsvps, joins
// web.values.range = week, 3month, all
Meetup.Data.chapterStats = [ {
		"name": "RSVPs",
		"color": "rgb(250,40,40)",
		"renderer": "line",
		"data": rsvps
	},
	{
		"name": "Active members",
		"renderer": "stack",
		"color": "rgba(100,125,150,0.5)",
		"data": members
	}, {
		"name": "Total members",
		"color": "rgb(50,40,180)",
		"renderer": "line",
		"data": totalMembers
	}
];

$(function() {

	var chartEl = document.querySelector("#chart"),
		timelineEl = document.getElementById('timeline'),
		yaxisEl = document.getElementById('y_axis'),
		yaxisEl2 = document.getElementById('y_axis2'),
		APIEventsURL = "//api.meetup.com/2/events?sign=true&group_id=" + Chapter.id + "&status=past&key=",
		annotations = [],
		annograph;

	$.ajax({
		dataType: 'jsonp',
		url: APIEventsURL,
		success: function(data) {
			LOG.info(data);
			data.results.forEach(function(mup) {
				annotations.push({
					"timestamp": new Date(mup.time).getTime() / 1000,
					"label": mup.name + " (" + mup.yes_rsvp_count + ")"
				})
			});
			annotate(annograph.annotator, annotations);
			annograph.graph.render();
		}
	});

	var palette = new Rickshaw.Color.Palette({ scheme: 'spectrum14' });


	// Meetup.RemoteApi.get({
	// 	url: "/api/",
	// 	data: {
	// 		"method": "getMeetstache",
	// 		"jy_key": "stats.chapter",
	// 		"jy_return_type": "json"
	// 	}
	// }).done(function(data) {
	// 	LOG.info(data);
	// });
	// Meetup.RemoteApi.get({
	// 	url: "/api/",
	// 	data: {
	// 		"method": "getMeetstache",
	// 		"jy_key": "stats.chapter",
	// 		"jy_return_type": "json"
	// 	}
	// }).done(function(data) {
	// 	LOG.info(data);
	// });
	annograph = makeGraph(Meetup.Data.chapterStats);

	function annotate(annotator, data) {
		data.forEach(function(datum) {
			annotator.add(datum.timestamp, datum.label);
		});
	}

	function makeGraph(series) {
		var graph = new Rickshaw.Graph( {
			element: document.querySelector("#chart"),
			width: 780,
			height: 340,
			renderer: 'multi',
			series: series
		} );

		var x_axis = new Rickshaw.Graph.Axis.Time( { graph: graph } ),
			y_axis = new Rickshaw.Graph.Axis.Y( {
				graph: graph,
				orientation: 'left',
				tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
				element: document.getElementById('y_axis'),
			} ),
			// y_axis2 = new Rickshaw.Graph.Axis.Y( {
			// 	graph: graph,
			// 	height: 340,
			// 	orientation: 'right',
			// 	tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
			// 	element: yaxisEl2,
			// } ),
			hoverDetail = new Rickshaw.Graph.HoverDetail( {
				graph: graph,
				formatter: function(series, x, y) {
					return series.name + ": " + parseInt(y, 10);
					// var mup = series.events[eventIndex-1],
					// 	eventTime = new Date(mup.time).toDateString();

					// return mup.name + "<br>" + eventTime;
				},
				xFormatter: function(x) {
					return new Date(x*1000).toDateString()
				}
			})
			annotator = new Rickshaw.Graph.Annotate({
				graph: graph,
				element: document.getElementById('timeline')
			});
			var legend = new Rickshaw.Graph.Legend({
				graph: graph,
				element: document.getElementById('legend')
			});
			var shelving = new Rickshaw.Graph.Behavior.Series.Toggle( {
				graph: graph,
				legend: legend
			} );


		graph.render();
		return {
			"graph": graph,
			"annotator": annotator
		};
	}


}());

