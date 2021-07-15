# todo-app

View these guides:

[backend guide](./backend/README.md)
[frontend guide](./frontend/README.md)

# Terminology
The goal of the system is to maximize utils over the interval [now, death).
The system deals with **goal intents**, **goals**, **time utility functions**, and **external events**.

* **Goal Intent**: A goal the user has typed in.
    Usually, when the user types in a goal, we are able to infer a goal from it directly.
    If we can't figure it out, (either it has no recognizable keywords or no deadline), then we leave it as a goal intent.
    These simply contain a name.

* **Goal**: A valuable goal to be accomplished.
    Goals are per user, not per resource by definition.
    However, different resources have may have differing goal affinities.
    This permits goals to be scheduled to other resources.
    Goals may depend on other goals.
    If a goal has multiple milestones, it is advantageous to make achieving each milestone a sub goal.
    Each subsequent milestone will have a dependency on the first.

    Goals must be converted into tasks, fixed time things on a user's calendar.
    The process of converting goals to tasks is called task allocation.

    When a goal is completed, it may have a favorable outcome (which awards utils to the user), 
    or an unfavorable outcome (which subtracts utils from the user).

* **Event**: Events are primarily there for compatibility when importing other programs' data. 
    They don't carry any metadata, just a name, time and description.
    Events can be generated from tasks, once they disappear into the past.
    However, events are not necessarily linked to goals.

## Thoughts on Scheduling
Here we'll discuss some critical ideas and tools we need to effectively schedule tasks.

All tasks take time to complete. 
However, users are usually unsure about exactly how much time will be spent.
Even if they do have a good idea, they often can't be bothered to spend time specifying.
The same thing applies to task reward. Users don't know how many utils a task provides, 
and won't bother to write it down

To handle this, we'll estimate the time and priority based on keywords, 
and the user will eventually correct it, since they have a calendar feed where they can easily 
adjust times without sorting.

Another important thing for our scheduling algorithm to handle is the idea of events with deadlines.
This is necessary in order to model things like attending classes, work, and submitting assignments.

* Hard Deadlines:
  * Unless a goal is completed before a certain, the goal will automatically resolve with an unfavorable outcome.
  * Ex: Attending an interview

* Soft Deadlines:
  * As more time after the deadline passes, the goal will tend to offer a lower reward
  * Ex: Submitting an assignment late

A significant problem is that it is impossible to fully schedule all goals, since it is possible for two goals to conflict in time. 
Thus, we must be able to handle scenarios where no solution is perfect.
Our solution is to generalize the idea of a deadline by instead adding the idea of time preference.

* **Time Utility Function**: A per goal time based distribution of number of utils that 
    will be gained per minute if the task is active in this range.
    The reward will vary based on time.
    You can read more on [wikipedia]( https://en.wikipedia.org/wiki/Time-utility_function ).

*Todo: Task salience (how much is any one task related to any other given task?)*
*This will help us provide tasks that are similar or different to the current task, based on the user's mood.*

Solving this problem is not trivial. 
In fact, finding an optimal solution has been proven to be NP-Hard.
Instead we'll work on providing a reasonable heuristic function that roughly sorts out most of the important parts, 
and work on providing a powerful interface for the user to correct mistakes and guide the process. 

## Thoughts on Solving Goal Dependencies

Goals may have zero, one, or many dependencies. 
This permits us to model multi-part goals, milestones, and split goals into more manageable chunks.

However, it introduces a constraint that we must obey during task creation:
1. All of a goal's dependencies must complete before the goal starts.
2. A goal may not depend on itself.

Since most goals will have 0 or 1 dependencies, this dependency graph is sparse.
Dependency graphs are also directed.
Thus, rather than an adjacency matrix, we will have an edge table.

## Our Algorithm

Our system is algorithm neutral, and does not mandate any one specific algorithm.
In the future we may provide multiple different options.

However, we need at least one scheduling algorithm to start out with, and we decided to choose [simulated annealing]( https://en.wikipedia.org/wiki/Simulated_annealing ).
This is a somewhat computationally expensive heuristic, but is relatively simple to implement.

