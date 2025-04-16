import { MongoClient, ObjectId } from "mongodb";
import { mongo_uri } from "../../config.json";

export interface VoteOption {
    description: string;
    voters: string[];
}

export enum VoteType {
    CouncilOnly,
    MembersOnly,
    Everyone
}

export interface Vote {
    _id?: ObjectId;
    id: string;
    description: string;
    endTimestamp: number;
    options: VoteOption[];
    type: VoteType;
    channel: string;
}

const mongo_client = new MongoClient(mongo_uri);
const database = mongo_client.db("uoc-bot");

const vote_collection = database.collection<Vote>("votes");
const ended_vote_collection = database.collection<Vote>("ended_votes");

async function get_vote_by_id(vote_id: string): Promise<Vote | null> {
    const vote: Vote | null = await vote_collection.findOne({id: vote_id});
    delete vote?._id;
    return vote;
} 

export async function create_vote(vote: Vote): Promise<boolean> {
    const res = await vote_collection.insertOne(vote);
    return res.acknowledged;
}

export async function get_vote(vote_id: string): Promise<Vote | null> {
    return await get_vote_by_id(vote_id);
}

export async function has_vote_ended(vote_id: string): Promise<boolean> {
    const vote = await get_vote_by_id(vote_id);
    if(vote == null) return true;
    return vote.endTimestamp < Date.now()
}
export function _noid_has_vote_ended(vote: Vote): boolean {
    return vote.endTimestamp < Date.now()
}

export async function list_active_votes(): Promise<Vote[]> {
    const votes_cursor = vote_collection.find();
    const votes: Vote[] = [];
    for await (const _vote of votes_cursor) {
        const vote: Vote = _vote;
        if(_noid_has_vote_ended(vote)) continue;
        delete vote._id;
        votes.push(vote);
    }
    return votes;
}

export async function list_all_votes(): Promise<Vote[]> {
    const votes_cursor = vote_collection.find();
    const votes: Vote[] = [];
    for await (const _vote of votes_cursor) {
        const vote: Vote = _vote;
        votes.push(vote);
    }
    return votes;
}

export async function move_vote_to_ended_votes(vote_id: string) {
    const vote: Vote | null = await vote_collection.findOneAndDelete({id: vote_id});
    if(vote == null) return;
    delete vote._id;
    await ended_vote_collection.insertOne(vote);
}

export async function set_vote_options(vote_id: string, options: VoteOption[]): Promise<boolean> {
    const res = await vote_collection.updateOne({id: vote_id}, {$set: {options: options}});
    return res.acknowledged;
}