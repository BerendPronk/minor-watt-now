![Food Truck Banner](https://raw.githubusercontent.com/BerendPronk/minor-watt-now/master/public/img/banner.png)

# Watt-now: Energy saving Prototype
The power usage on festivals, more often than not, exceeds the necessary power output required for the festival to run for a weekend. One of the culprits of this problem is the group of food trucks atttending the festival. Though drawing power off the temporaty grid at all times, the food trucks do not serve food to the visitors the entirety of the festival, meaning they waste expensive electricity.

Because the grid on most festivals is set-up with multiple diesel generators, using power also means polluting the air with  CO2-gas. This could be prevented with some traditional methods, like: Using energy-efficient devices or tank the generators with biodiesel. However, I chose to be unique with my idea: Connecting every foodtruck to a real-time data network, only available on the festival, to keep track of each transaction the food trucks make. This'll sense whether a food truck has a crowd of hungry visitors in front of it, and can send them somewhere else on the festival by giving discounts.

Before this can be implemented, participating food trucks need to be willing to sell their products with a discount at some time during the festival. If this means they sell more of their food at a time where usually no one is in line, it should be a good bargain.

---

## First steps
If you do decide to experiment with the code of this project yourself, you must clone this repository first. You can do this by typing the following command in your terminal:  

```shell
$ git clone https://github.com/BerendPronk/minor-watt-now.git
```

Then navigate to the folder you just cloned this repository in:

```shell
$ cd minor-watt-now
```

The dependencies necessary are not included in this repository. You need to install these first, before being able to launch the application. Type the following in your terminal:

```shell
$ npm install
```

If the progressbar is entirely filled, the installment of packages was successful. You can now start the application by setting up the server. The app will be served on http://localhost:3000.

```shell
$ nodemon server.js
```

---

## Features
This project is a result of two courses I followed during my Every Thing web minor (2017): Real-time web and Web of Things. The knowledge I gained during these courses were essential to implement, for this project to work. The built-in features are listed below, per relevant category:

### Real-time data transfering
#### Websockets
The server, webclient and coin collector (coin counting box located in each food truck) are all connected to a websocket that's initialized in the server. This feature makes real-time data transfering between devices possible.

#### Broadcasting
By implementing a broadcast function, data can be sent over socket to all connected devices at the same time. The outcome functionality depends on the code each device runs. Broadcasting makes it possible for every device to act differently on a single event.

#### Binding real-time data via server
When a food truck owner decides to borrow a coin collector, it's activated and waiting to be registered. Registration happens by assigning a location on the festival map by clicking a spot. Once a spot has been chosen, a registry form pop-up where the administrator can provide the food truck location with the proper name, product to be sold and the average price of products being sold (necessary to measure amount of transactions, instead of incoming coins).
This newly registered food truck gets stored in a variable on the server, which can be reached by the webclient and by the coin collector itself.

This prototype has an initial list of dummy food trucks, located in [participants.js](https://github.com/BerendPronk/minor-watt-now/blob/master/public/data/participants.js).

### NodeMCU Hardware
#### Coin-sensing hopper
Within the hardware of the coin collector, a flex-sensor is attached in the coinslots. When a coin falls through, it senses movement from the gravity applied. The NodeMCU located in the coin collector counts the coins. If the amount of coins has reached the food trucks average sell price, an event will be sent to the server, adding a person to the length of the food truck's queue.

#### Servo-powered money tray
The coin collector features a empty / reset button on the side. The food truck owner should press this button if there is no one waiting in line before him. This empties the storage of the box with a little help from a SG90 servo motor, and lets the server know that the length of the specific food truck's queue should be reset to 0; eventually generating more visitors for the food truck by assigning it to the list of potential discounts.

#### Crowd detection
When a coin collector senses 10 or more people waiting in line for one single food truck, the server is requested to generate a discount for the food truck with the shortest queue. If it so happens that multiple food truck both have the shortest queue, one will be picked out at random and receive the discount on their product. This discount will be presented at the jumbotron display (webclient) for 15 minutes total, so the people waiting in front of an already crowded food truck can change their minds and go to the food truck with the assigned discount.

---

## Visualized socket flow
The following schematic features the flow of communications between all devices connected to the main (ref: cloud) server. The server sends and receives messages / events from both the coin collector and the jumbotron display.

![Flow diagramm](https://raw.githubusercontent.com/BerendPronk/minor-watt-now/master/public/img/flow-diagram.jpg)

---

## Wishlist
Since this project was thought out, designed and built in 4 days, it's only logical that there are still some things left undone. The next list consists of a few features I'd still like to add to this project if I continue working on it. 

- Responsive mobile application, meant for the visitors; to keep track of the available discounts on the festival.
- Segment application in different views:
  - An administrator view for the back-end (festival selection, registration of coinboxes and data management)
  - A seperate view for the jumbotron, displaying only the map of the festival with notifications / messages
  - As earlier mentioned, a visitor view, for mobile devices
- Add to clarity to festival map, plotting visual data real-time for every food truck
- Add more data for every food truck to be displayed
- Implementing a database for all festivals and registered food trucks 

Want to participate in realizing these features? Create a pull request to show me your skills!

## Feedback
If you happen to notice any flaw on my part that couldn't be left undone, feel free to notify me by creating an issue on this repository. Pull request are very much appreciated, as well.

## License

[MIT](https://github.com/BerendPronk/minor-watt-now/blob/master/LICENSE)

Copyright - Berend Pronk

2017
