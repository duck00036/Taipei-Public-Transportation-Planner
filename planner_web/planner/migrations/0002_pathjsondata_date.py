# Generated by Django 4.2.1 on 2023-05-13 17:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('planner', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='pathjsondata',
            name='date',
            field=models.DateField(db_column='date', default=None),
            preserve_default=False,
        ),
    ]