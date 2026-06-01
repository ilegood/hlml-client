import assert from "node:assert/strict";
import test from "node:test";
import {
  createClientMessageId,
  createPendingFileId,
  isCompact,
  isSameDay,
  normalizeRoomAppointment,
} from "./chatHelpers.js";

test("isSameDay compares calendar day only", () => {
  assert.equal(
    isSameDay("2026-06-01T01:00:00", "2026-06-01T23:00:00"),
    true,
  );
  assert.equal(
    isSameDay("2026-06-01T23:00:00", "2026-06-02T00:00:00"),
    false,
  );
});

test("isCompact groups consecutive messages from the same user within two minutes", () => {
  const previous = {
    userId: 1,
    time: "2026-06-01T10:00:00.000Z",
  };

  assert.equal(
    isCompact(previous, {
      userId: 1,
      time: "2026-06-01T10:01:59.000Z",
    }),
    true,
  );
  assert.equal(
    isCompact(previous, {
      userId: 2,
      time: "2026-06-01T10:01:00.000Z",
    }),
    false,
  );
});

test("normalizeRoomAppointment returns stable defaults and numeric fields", () => {
  assert.deepEqual(normalizeRoomAppointment(), {
    date: "",
    time: "",
    place: "",
    latitude: null,
    longitude: null,
    capacity: 0,
    participants: 0,
    status: "",
  });

  assert.deepEqual(
    normalizeRoomAppointment({
      date: "2026-06-01",
      latitude: "37.5",
      longitude: "127.1",
      capacity: "4",
      participants: "2",
    }),
    {
      date: "2026-06-01",
      time: "",
      place: "",
      latitude: 37.5,
      longitude: 127.1,
      capacity: 4,
      participants: 2,
      status: "",
    },
  );
});

test("client generated ids include stable prefixes and file metadata", () => {
  assert.match(createClientMessageId(), /^client-/);
  assert.match(
    createPendingFileId({
      name: "image.png",
      size: 123,
      lastModified: 456,
    }),
    /^image\.png-123-456-/,
  );
});
