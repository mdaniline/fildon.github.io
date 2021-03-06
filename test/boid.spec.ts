import * as chai from "chai";
import * as mocha from "mocha";
import { Boid } from "../src/boid";
import { config } from "../src/config";
import { Vector2 } from "../src/vector2";

const expect = chai.expect;

describe("Boid", () => {
    describe("constructor", () => {
        it("clips position inside area", () => {
            const boid = new Boid();
            expect(boid.position.x).to.be.gte(config.minX);
            expect(boid.position.x).to.be.lte(config.maxX);
            expect(boid.position.y).to.be.gte(config.minY);
            expect(boid.position.y).to.be.lte(config.maxY);
        });

        it("sets an intitial speed within the config", () => {
            const boid = new Boid();
            expect(boid.velocity.length()).to.be.lte(config.maxSpeed);
            expect(boid.velocity.length()).to.be.gte(config.minSpeed);
        });
    });

    describe("nearest neighbour", () => {
        it("throws if no other boids", () => {
            const boid = new Boid();
            expect(boid.nearestNeighbour.bind(boid)).to.throw();
        });

        it("returns the nearest boid", () => {
            const boid = new Boid();
            const nearBoid = new Boid();
            const farBoid = new Boid();
            const evenFurtherBoid = new Boid();
            boid.position = new Vector2(0, 0);
            nearBoid.position = new Vector2(1, 0);
            farBoid.position = new Vector2(1, 1);
            evenFurtherBoid.position = new Vector2(2, 2);
            boid.otherBoids = [farBoid, nearBoid, evenFurtherBoid];
            expect(boid.nearestNeighbour()).to.equal(nearBoid);
        });
    });

    describe("movement", () => {
        it("adds velocity to position", () => {
            const boid = new Boid();
            boid.position = new Vector2(10, 20);
            boid.velocity = new Vector2(30, 40);
            boid.move();
            const expected = new Vector2(40, 60);
            expect(boid.position.equals(expected)).to.equal(true);
        });
    });

    describe("repulsion", () => {
        it("gets a repulsion vector with one boid too near", () => {
            const boid = new Boid();
            boid.position = new Vector2(0, 0);
            const boidA = new Boid();
            boidA.position = new Vector2(1, 1).scaleToLength(config.repulsionRadius / 2);
            boid.otherBoids = [boidA];

            const actual = boid.repulsionVector();
            const expected = new Vector2(-1, -1).unitVector();

            expect(actual.distance(expected)).to.be.lte(0.0000001);
        });

        it("gets a repulsion vector with multiple boids too near", () => {
            const boid = new Boid();
            boid.position = new Vector2(0, 0);
            const boidA = new Boid();
            boidA.position = new Vector2(0, 1).scaleToLength(config.repulsionRadius / 2);
            const boidB = new Boid();
            boidB.position = new Vector2(1, 0).scaleToLength(config.repulsionRadius / 2);

            boid.otherBoids = [boidA, boidB];

            const actual = boid.repulsionVector();
            const expected = new Vector2(-1, -1).unitVector();

            expect(actual.distance(expected)).to.be.lte(0.0000001);
        });
    });

    describe("attraction", () => {
        it("returns the zero vector if no other boids in range", () => {
            const boid = new Boid();

            const actual = boid.attractionVector();
            const expected = new Vector2(0, 0);

            expect(actual.distance(expected)).to.be.lte(0.0000001);
        });

        it("attracts to sole boid in range", () => {
            const boid = new Boid();
            boid.position = new Vector2(0, 0);
            const nearBoid = new Boid();
            nearBoid.position = new Vector2(1, 1);
            boid.otherBoids = [nearBoid];

            const actual = boid.attractionVector();
            const expected = new Vector2(1, 1).unitVector();

            expect(actual.distance(expected)).to.be.lte(0.0000001);
        });

        it("attracts to average of multiple near boids", () => {
            const boid = new Boid();
            boid.position = new Vector2(0, 0);
            const boidA = new Boid();
            boidA.position = new Vector2(1, 1);
            const boidB = new Boid();
            boidB.position = new Vector2(-1, 1);
            boid.otherBoids = [boidA, boidB];

            const actual = boid.attractionVector();
            const expected = new Vector2(0, 1);

            expect(actual.distance(expected)).to.be.lte(0.0000001);
        });
    });

    describe("neighbours", () => {
        it("returns none if there are no other boids", () => {
            const boid = new Boid();

            const actual = boid.neighbours(10);

            expect(actual.length).to.equal(0);
        });

        it("returns none if there are no boids in range", () => {
            const boid = new Boid();
            boid.position = new Vector2(0, 0);
            const farBoid = new Boid();
            farBoid.position = new Vector2(1, 1);

            const actual = boid.neighbours(1);

            expect(actual.length).to.equal(0);
        });

        it("returns a boid in range", () => {
            const boid = new Boid();
            boid.position = new Vector2(0, 0);
            const nearBoid = new Boid();
            nearBoid.position = new Vector2(1, 1);
            boid.otherBoids = [nearBoid];

            const actual = boid.neighbours(2);

            expect(actual.length).to.equal(1);
            expect(actual[0]).to.equal(nearBoid);
        });

        it("returns only those boids that are in range", () => {
            const boid = new Boid();
            boid.position = new Vector2(0, 0);
            const nearBoid = new Boid();
            nearBoid.position = new Vector2(0, 1);
            const farBoid = new Boid();
            farBoid.position = new Vector2(2, 1);
            boid.otherBoids = [nearBoid, farBoid];

            const actual = boid.neighbours(2);

            expect(actual.length).to.equal(1);
            expect(actual[0]).to.be.equal(nearBoid);
        });
    });
});
