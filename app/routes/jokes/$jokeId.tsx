import { Joke } from ".prisma/client";
import { Link, LoaderFunction, useLoaderData, useParams } from "remix";
import { db } from "~/utils/db.server";

type LoaderData = { joke: Joke | null };

export let loader: LoaderFunction = async ({ params }) => {
  let joke = await db.joke.findUnique({
    where: { id: params.jokeId },
  });
  if (!joke) throw new Error("Joke not found");
  let data = { joke };
  return data;
};

export default function JokeRoute() {
  let data = useLoaderData<LoaderData>();
  return (
    <div>
      <p>Here's your hilarious joke:</p>
      <p>{data.joke?.content}</p>
      <Link to=".">{data.joke?.name} Permalink</Link>
    </div>
  );
}

export function ErrorBoundary() {
  let { jokeId } = useParams();
  return (
    <div className="error-container">{`There was an error loading joke by the id ${jokeId}. Sorry.`}</div>
  );
}
