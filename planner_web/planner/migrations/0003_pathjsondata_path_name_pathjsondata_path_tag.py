# Generated by Django 4.2.1 on 2023-05-13 21:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('planner', '0002_pathjsondata_date'),
    ]

    operations = [
        migrations.AddField(
            model_name='pathjsondata',
            name='path_name',
            field=models.CharField(blank=True, db_column='path_name', db_index=True, max_length=30, null=True),
        ),
        migrations.AddField(
            model_name='pathjsondata',
            name='path_tag',
            field=models.CharField(blank=True, db_column='path_tag', db_index=True, max_length=200, null=True),
        ),
    ]
